import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useWakeLock } from '../lib/wakeLock';
import { createDefaultEntry, type AnchorSet, type DressEntry } from '../types';
import { loadImageWithCorrectOrientation } from '../lib/exif';
import { debounce } from '../lib/debounce';
import { defaultAnchors } from '../lib/defaultAnchors';
import { landmarksToAnchors } from '../lib/pose';
import { getPinnedTabs, togglePinnedTab } from '../lib/pinnedTabs';
import { generateDressImage, AIGenerationError } from '../lib/aiClient';
import { paramsHash } from '../lib/paramsHash';
import { dataUrlToPngBlob, downloadPngBlob } from '../lib/downloadPng';
import { DressCanvas } from '../components/DressCanvas';
import { ParameterPanel } from '../components/ParameterPanel';
import { BasicPanel } from '../components/panels/BasicPanel';
import { SilhouettePanel } from '../components/panels/SilhouettePanel';
import { AnchorPanel } from '../components/panels/AnchorPanel';
import { PenPanel } from '../components/panels/PenPanel';
import { MetadataPanel } from '../components/panels/MetadataPanel';
import { NecklinePanel } from '../components/panels/NecklinePanel';
import { SleevePanel } from '../components/panels/SleevePanel';
import { BodicePanel } from '../components/panels/BodicePanel';
import { BackPanel } from '../components/panels/BackPanel';
import { FabricPanel } from '../components/panels/FabricPanel';
import { ColorPanel } from '../components/panels/ColorPanel';
import { SkirtPanel } from '../components/panels/SkirtPanel';
import { EmbellishmentsPanel } from '../components/panels/EmbellishmentsPanel';
import { VeilPanel } from '../components/panels/VeilPanel';
import { AccessoryPanel } from '../components/panels/AccessoryPanel';
import type { SketchOverlayHandle } from '../components/SketchOverlay';
import type { RegionPrompt } from '../types';

type TabId = 'basic' | 'silhouette' | 'neckline' | 'sleeve' | 'bodice' | 'back' | 'fabric' | 'color' | 'skirt' | 'embellishments' | 'veil' | 'hair' | 'anchor' | 'pen' | 'meta';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'basic', label: '기본' },
  { id: 'silhouette', label: '실루엣' },
  { id: 'neckline', label: '넥라인' },
  { id: 'sleeve', label: '소매' },
  { id: 'bodice', label: '보디스' },
  { id: 'back', label: '등판' },
  { id: 'fabric', label: '원단' },
  { id: 'color', label: '컬러' },
  { id: 'skirt', label: '스커트' },
  { id: 'embellishments', label: '장식' },
  { id: 'veil', label: '베일' },
  { id: 'hair', label: '헤어' },
  { id: 'anchor', label: '앵커' },
  { id: 'pen', label: '펜' },
  { id: 'meta', label: '메모' },
];

export default function Edit() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname === '/new';
  const navigate = useNavigate();
  const { meta, entries, upsertEntry, hydrated, hydrate } = useAppStore();

  const [photoDims, setPhotoDims] = useState<{ w: number; h: number } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [manualMode, setManualMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pinnedTabs, setPinnedTabs] = useState<string[]>(() => getPinnedTabs());

  // AI generation state
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [extraPrompt, setExtraPrompt] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const sortedTabs = useMemo(() => {
    const pinned = TABS.filter((t) => pinnedTabs.includes(t.id));
    const unpinned = TABS.filter((t) => !pinnedTabs.includes(t.id));
    return [...pinned, ...unpinned];
  }, [pinnedTabs]);

  function handlePinToggle(id: string) {
    togglePinnedTab(id);
    setPinnedTabs(getPinnedTabs());
  }

  // Pen state
  const [brushSize, setBrushSize] = useState<'thin' | 'medium' | 'thick'>('medium');
  const [penColor, setPenColor] = useState<'black' | 'navy' | 'red'>('black');
  const [acceptFinger, setAcceptFinger] = useState(false);
  const sketchRef = useRef<SketchOverlayHandle>(null);

  // Working copies
  const [currentEntry, setCurrentEntry] = useState<DressEntry | null>(null);
  const [currentAnchors, setCurrentAnchors] = useState<AnchorSet | null>(null);

  // Hydrate store on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Resolve entry once store is ready. For new entries, wait for photoDims so
  // anchors are computed against the real image (not the 800x1200 fallback).
  useEffect(() => {
    if (!hydrated) return;
    if (isNew) {
      if (!photoDims) return; // wait for photo to load
      // Prefer detected pose landmarks; fall back to proportional defaults.
      let anchors: AnchorSet;
      if (meta?.poseLandmarks) {
        anchors = landmarksToAnchors({
          landmarks: meta.poseLandmarks,
          confidence: {},
          imageWidth: photoDims.w,
          imageHeight: photoDims.h,
        });
      } else {
        anchors = defaultAnchors(photoDims.w, photoDims.h);
      }
      const newEntry = createDefaultEntry(crypto.randomUUID(), anchors);
      setCurrentEntry(newEntry);
      setCurrentAnchors(anchors);
    } else if (id) {
      const found = entries.find((e) => e.id === id);
      if (found) {
        setCurrentEntry(found);
        setCurrentAnchors(found.anchors);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isNew, id, photoDims, meta?.poseLandmarks]);

  // Load photo dimensions
  useEffect(() => {
    if (!meta?.basePhoto) return;
    let cancelled = false;
    loadImageWithCorrectOrientation(meta.basePhoto).then(({ width, height }) => {
      if (!cancelled) setPhotoDims({ w: width, h: height });
    }).catch(() => { /* ignore */ });
    return () => { cancelled = true; };
  }, [meta?.basePhoto]);

  // Redirect if no photo
  useEffect(() => {
    if (hydrated && !meta?.basePhoto) {
      navigate('/');
    }
  }, [hydrated, meta, navigate]);

  // Debounced autosave
  const debouncedSave = useMemo(
    () =>
      debounce((entry: DressEntry) => {
        upsertEntry(entry).finally(() => setSaving(false));
      }, 300),
    [upsertEntry],
  );

  // Cancel debounce on unmount to avoid calling setSaving on unmounted component
  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  const handleEntryChange = useCallback(
    (patch: Partial<DressEntry>) => {
      setCurrentEntry((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        setSaving(true);
        debouncedSave(next);
        return next;
      });
    },
    [debouncedSave],
  );

  const handleAnchorChange = useCallback(
    (next: AnchorSet) => {
      setCurrentAnchors(next);
      handleEntryChange({ anchors: next });
    },
    [handleEntryChange],
  );

  const handleRegionAdd = useCallback(
    (region: RegionPrompt) => {
      setCurrentEntry((prev) => {
        if (!prev) return prev;
        const next = { ...prev, regionPrompts: [...(prev.regionPrompts ?? []), region] };
        setSaving(true);
        debouncedSave(next);
        return next;
      });
    },
    [debouncedSave],
  );

  const handleRegionDelete = useCallback(
    (id: string) => {
      setCurrentEntry((prev) => {
        if (!prev) return prev;
        const next = { ...prev, regionPrompts: (prev.regionPrompts ?? []).filter((r) => r.id !== id) };
        setSaving(true);
        debouncedSave(next);
        return next;
      });
    },
    [debouncedSave],
  );

  const handleGenerate = useCallback(async (iterate: boolean) => {
    if (!meta?.basePhoto || !currentEntry) return;
    setGenerating(true);
    setGenerateError(null);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const result = await generateDressImage({
        photoBlob: meta.basePhoto,
        entry: currentEntry,
        extraInstructions: extraPrompt || undefined,
        iterate,
        signal: ctrl.signal,
      });
      handleEntryChange({ aiResult: result });
    } catch (e) {
      if (e instanceof AIGenerationError) {
        setGenerateError(e.message);
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [meta?.basePhoto, currentEntry, extraPrompt, handleEntryChange]);

  const handleCancelGenerate = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleReferenceDressUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        handleEntryChange({ referenceDress: { dataUrl, uploadedAt: Date.now() } });
      };
      reader.readAsDataURL(file);
    },
    [handleEntryChange],
  );

  const handleClearReferenceDress = useCallback(() => {
    handleEntryChange({ referenceDress: null });
  }, [handleEntryChange]);

  const handleDownloadPng = useCallback(async () => {
    if (!currentEntry?.aiResult) return;
    try {
      const blob = await dataUrlToPngBlob(currentEntry.aiResult.dataUrl);
      const name = `${currentEntry.nickname || 'dress'}-${Date.now()}.png`;
      downloadPngBlob(blob, name);
    } catch {
      // Silently ignore download failures (e.g. in test environment)
    }
  }, [currentEntry]);

  const handleAnchorReset = useCallback(() => {
    if (!currentEntry) return;
    const d = photoDims ?? { w: 800, h: 1200 };
    const fresh: AnchorSet = meta?.poseLandmarks
      ? landmarksToAnchors({
          landmarks: meta.poseLandmarks,
          confidence: {},
          imageWidth: d.w,
          imageHeight: d.h,
        })
      : defaultAnchors(d.w, d.h);
    setCurrentAnchors(fresh);
    handleEntryChange({ anchors: fresh });
  }, [currentEntry, photoDims, meta?.poseLandmarks, handleEntryChange]);

  // Keep screen awake while editing a dress entry
  useWakeLock(hydrated && !!currentEntry);

  if (!hydrated || !currentEntry || !currentAnchors || !meta?.basePhoto) {
    return (
      <div className="flex items-center justify-center h-screen text-ink-400 text-sm bg-cream-100">
        불러오는 중…
      </div>
    );
  }

  const dims = photoDims ?? { w: 800, h: 1200 };

  function renderPanel() {
    if (!currentEntry || !currentAnchors) return null;
    switch (activeTab) {
      case 'basic':
        return (
          <BasicPanel
            entry={currentEntry}
            onChange={(patch) => handleEntryChange(patch)}
          />
        );
      case 'silhouette':
        return (
          <SilhouettePanel
            value={currentEntry.silhouette}
            onChange={(s) => handleEntryChange({ silhouette: s })}
          />
        );
      case 'neckline':
        return (
          <NecklinePanel
            value={currentEntry.neckline}
            onChange={(n) => handleEntryChange({ neckline: n })}
          />
        );
      case 'sleeve':
        return (
          <SleevePanel
            value={currentEntry.sleeve}
            onChange={(s) => handleEntryChange({ sleeve: s })}
          />
        );
      case 'bodice':
        return (
          <BodicePanel
            value={currentEntry.bodice}
            onChange={(b) => handleEntryChange({ bodice: b })}
          />
        );
      case 'back':
        return (
          <BackPanel
            value={currentEntry.back}
            onChange={(b) => handleEntryChange({ back: b })}
          />
        );
      case 'fabric':
        return (
          <FabricPanel
            value={currentEntry.fabric}
            onChange={(f) => handleEntryChange({ fabric: f })}
          />
        );
      case 'color':
        return (
          <ColorPanel
            value={currentEntry.color}
            onChange={(c) => handleEntryChange({ color: c })}
          />
        );
      case 'skirt':
        return (
          <SkirtPanel
            value={currentEntry.skirt}
            onChange={(s) => handleEntryChange({ skirt: s })}
          />
        );
      case 'embellishments':
        return (
          <EmbellishmentsPanel
            value={currentEntry.embellishments}
            accentColor={currentEntry.color.accent}
            onChange={(e) => handleEntryChange({ embellishments: e })}
          />
        );
      case 'veil':
        return (
          <VeilPanel
            value={currentEntry.veil}
            onChange={(v) => handleEntryChange({ veil: v })}
          />
        );
      case 'hair':
        return (
          <AccessoryPanel
            value={currentEntry.accessory}
            onChange={(a) => handleEntryChange({ accessory: a })}
          />
        );
      case 'anchor':
        return (
          <AnchorPanel
            manualMode={manualMode}
            onManualModeChange={setManualMode}
            onReset={handleAnchorReset}
          />
        );
      case 'pen':
        return (
          <PenPanel
            brushSize={brushSize}
            color={penColor}
            acceptFinger={acceptFinger}
            onBrushSizeChange={setBrushSize}
            onColorChange={setPenColor}
            onAcceptFingerChange={setAcceptFinger}
            onUndo={() => sketchRef.current?.undoStroke()}
            onClearInProgress={() => sketchRef.current?.clearInProgress()}
            onFinishRegion={() => sketchRef.current?.finishRegion() ?? null}
            savedRegions={currentEntry.regionPrompts ?? []}
            onRegionAdd={handleRegionAdd}
            onRegionDelete={handleRegionDelete}
          />
        );
      case 'meta':
        return (
          <MetadataPanel
            entry={currentEntry}
            onChange={(patch) => handleEntryChange(patch)}
          />
        );
    }
  }

  const title = currentEntry.nickname || '새 드레스';

  const isStale =
    !!currentEntry.aiResult &&
    currentEntry.aiResult.paramsHash !== paramsHash(currentEntry);

  const canGenerate = !!meta?.basePhoto && !generating;
  const hasAiResult = !!currentEntry.aiResult;

  const showCanvas = activeTab === 'pen' || activeTab === 'anchor' || !!currentEntry.aiResult;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur border-b border-ink-100/60">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="btn-ghost p-2 -ml-2 rounded-lg"
            aria-label="뒤로"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-ink-900 truncate text-base">{title}</h1>
            <p className="text-xs text-ink-400">{saving ? '저장 중…' : '저장됨'}</p>
          </div>
          {isStale && (
            <span className="hidden sm:inline text-[11px] text-rose-600 bg-rose-50 px-2 py-1 rounded-full font-medium" aria-label="변경됨 표시">변경됨</span>
          )}
          <div className="flex items-center gap-2">
            {generating ? (
              <button
                onClick={handleCancelGenerate}
                aria-label="AI 합성 취소"
                className="text-xs px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
              >
                생성 중… (취소)
              </button>
            ) : hasAiResult ? (
              <>
                <button
                  onClick={() => void handleGenerate(true)}
                  disabled={!canGenerate}
                  aria-label="이어서 다듬기"
                  className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  🔄 이어서 다듬기
                </button>
                <button
                  onClick={() => void handleGenerate(false)}
                  disabled={!canGenerate}
                  aria-label="처음부터 다시 합성"
                  className="text-xs px-3 py-1.5 rounded-xl border border-ink-100/60 text-ink-400 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ↻ 처음부터
                </button>
              </>
            ) : (
              <button
                onClick={() => void handleGenerate(false)}
                disabled={!canGenerate}
                aria-label="AI 합성 시작"
                className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✨ AI 합성
              </button>
            )}
            {currentEntry.aiResult && (
              <button
                onClick={() => void handleDownloadPng()}
                aria-label="PNG 다운로드"
                className="text-xs px-3 py-1.5 rounded-xl border border-ink-100/60 text-ink-400 hover:bg-cream-100"
              >
                📥 PNG
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Stacked main content */}
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
        {/* AI 합성 옵션 card */}
        <section className="card p-6" aria-label="ai-section">
          <p className="label-caps mb-3">AI 합성 옵션</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {currentEntry.referenceDress ? (
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={currentEntry.referenceDress.dataUrl}
                    alt="참고 드레스"
                    className="w-16 h-20 object-cover rounded-lg ring-1 ring-ink-100"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900">레퍼런스 드레스</p>
                    <p className="text-xs text-ink-400">합성 시 참조 디자인으로 사용됩니다</p>
                  </div>
                  <button
                    onClick={handleClearReferenceDress}
                    aria-label="참고 드레스 제거"
                    className="btn-ghost text-xs"
                  >
                    제거
                  </button>
                </div>
              ) : (
                <label
                  className="flex-1 py-3 px-4 border-2 border-dashed border-rose-200 hover:border-rose-300 hover:bg-rose-50/50 text-rose-500 rounded-xl text-sm font-medium text-center transition-colors cursor-pointer"
                  aria-label="참고 드레스 업로드"
                >
                  + 레퍼런스 드레스 사진 (선택)
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReferenceDressUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>

            <textarea
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
              placeholder="레이스 더 풍성하게, 소매 짧게, 약간 빈티지 느낌…"
              rows={3}
              aria-label="추가 지시사항"
              className="w-full bg-cream-50 border border-ink-100/60 rounded-xl px-4 py-3 text-sm placeholder:text-ink-400/70 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 resize-none"
            />

            {generateError && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3" role="alert">
                {generateError}
              </div>
            )}

            {hasAiResult && (
              <p className="text-xs text-ink-400 text-center">
                ↺ 이어서 다듬기는 기존 결과의 디테일을 유지하며 변경 사항만 반영합니다.
              </p>
            )}
          </div>
        </section>

        {/* Canvas card */}
        <div className="card overflow-hidden">
          {showCanvas ? (
            <DressCanvas
              photo={meta.basePhoto}
              photoWidth={dims.w}
              photoHeight={dims.h}
              entry={currentEntry}
              anchors={currentAnchors}
              showAnchors={activeTab === 'anchor'}
              showSketch={activeTab === 'pen'}
              manualMode={manualMode}
              onAnchorChange={handleAnchorChange}
              aiResultDataUrl={currentEntry.aiResult?.dataUrl ?? null}
              className="w-full"
              sketchRef={sketchRef}
              savedRegions={currentEntry.regionPrompts ?? []}
              sketchBrushSize={brushSize}
              sketchColor={penColor}
              sketchAcceptFinger={acceptFinger}
            />
          ) : (
            <div className="relative aspect-[3/4] bg-cream-50 flex items-center justify-center">
              <div className="relative z-10 text-center p-8 bg-white/90 rounded-2xl shadow-paper backdrop-blur-sm max-w-xs mx-auto">
                <p className="text-base font-semibold text-ink-900 mb-2">아직 합성 전이에요</p>
                <p className="text-sm text-ink-400 leading-relaxed">
                  파라미터를 조정한 다음 상단의<br />
                  <span className="text-rose-500 font-medium">✨ AI 합성</span> 버튼을 눌러보세요.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Parameter panel area */}
        <div aria-label="parameter-panel-area">
          <ParameterPanel
            tabs={sortedTabs}
            activeId={activeTab}
            onActiveChange={(id) => setActiveTab(id as TabId)}
            pinnedTabIds={pinnedTabs}
            onPinToggle={handlePinToggle}
          >
            <div className="card p-6 sm:p-8">
              {renderPanel()}
            </div>
          </ParameterPanel>
        </div>
      </main>
    </div>
  );
}
