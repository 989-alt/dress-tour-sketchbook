import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { createDefaultEntry, type AnchorSet, type DressEntry } from '../types';
import { loadImageWithCorrectOrientation } from '../lib/exif';
import { debounce } from '../lib/debounce';
import { defaultAnchors } from '../lib/defaultAnchors';
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
import type { SketchOverlayHandle } from '../components/SketchOverlay';

type TabId = 'basic' | 'silhouette' | 'neckline' | 'sleeve' | 'bodice' | 'back' | 'fabric' | 'color' | 'skirt' | 'anchor' | 'pen' | 'meta';

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

  // Pen state
  const [brushSize, setBrushSize] = useState<'thin' | 'medium' | 'thick'>('medium');
  const [penColor, setPenColor] = useState<'black' | 'navy' | 'red'>('black');
  const [eraser, setEraser] = useState(false);
  const [acceptFinger, setAcceptFinger] = useState(false);
  const sketchRef = useRef<SketchOverlayHandle>(null);

  // Working copies
  const [currentEntry, setCurrentEntry] = useState<DressEntry | null>(null);
  const [currentAnchors, setCurrentAnchors] = useState<AnchorSet | null>(null);

  // Hydrate store on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Resolve entry once store is ready
  useEffect(() => {
    if (!hydrated) return;
    if (isNew) {
      const dims = photoDims ?? { w: 800, h: 1200 };
      const anchors = defaultAnchors(dims.w, dims.h);
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
  }, [hydrated, isNew, id]);

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

  const handleAnchorReset = useCallback(() => {
    if (!currentEntry) return;
    const d = photoDims ?? { w: 800, h: 1200 };
    const fresh = defaultAnchors(d.w, d.h);
    setCurrentAnchors(fresh);
    handleEntryChange({ anchors: fresh });
  }, [currentEntry, photoDims, handleEntryChange]);

  if (!hydrated || !currentEntry || !currentAnchors || !meta?.basePhoto) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 text-sm">
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
            eraser={eraser}
            acceptFinger={acceptFinger}
            onBrushSizeChange={setBrushSize}
            onColorChange={setPenColor}
            onEraserChange={setEraser}
            onAcceptFingerChange={setAcceptFinger}
            onUndo={() => sketchRef.current?.undo()}
            onClear={() => sketchRef.current?.clear()}
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

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-800 text-xl leading-none"
          aria-label="뒤로"
        >
          ←
        </button>
        <h1 className="flex-1 text-sm font-semibold text-gray-800 truncate">{title}</h1>
        <span className="text-xs text-gray-400">{saving ? '저장 중...' : '저장됨'}</span>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: canvas ~60% */}
        <div className="w-3/5 flex items-start justify-center overflow-auto bg-gray-100 p-2">
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
            onSketchChange={(png) => handleEntryChange({ sketchPng: png })}
            className="max-w-full"
          />
        </div>

        {/* Right: panels ~40% */}
        <div className="w-2/5 border-l border-gray-200 flex flex-col" aria-label="parameter-panel-area">
          <ParameterPanel
            tabs={TABS}
            activeId={activeTab}
            onActiveChange={(id) => setActiveTab(id as TabId)}
          >
            {renderPanel()}
          </ParameterPanel>
        </div>
      </div>
    </div>
  );
}
