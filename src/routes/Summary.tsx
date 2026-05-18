import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { EntryCard } from '../components/EntryCard';
import { SummaryDetailModal } from '../components/SummaryDetailModal';
import { CompareModal } from '../components/CompareModal';
import { exportAllToJson, downloadJsonFile } from '../lib/exportJson';
import { exportSummaryGridToPng, downloadPngBlob } from '../lib/exportPng';
import type { DressEntry } from '../types';

type SortKey = 'stars' | 'createdAt' | 'nickname' | 'shop';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'stars', label: '별점합' },
  { value: 'createdAt', label: '작성 시간' },
  { value: 'nickname', label: '별명' },
  { value: 'shop', label: '매장' },
];

function totalStars(entry: DressEntry): number {
  return Object.values(entry.ratings).reduce((sum, v) => sum + v, 0);
}

export default function Summary() {
  const navigate = useNavigate();
  const meta = useAppStore((s) => s.meta);
  const entries = useAppStore((s) => s.entries);
  const [sortKey, setSortKey] = useState<SortKey>('stars');
  const [selected, setSelected] = useState<DressEntry | null>(null);

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<[DressEntry, DressEntry] | null>(null);
  const [compareSelecting, setCompareSelecting] = useState<DressEntry[]>([]);

  const photoRef = useRef<{ w: number; h: number }>({ w: 400, h: 800 });

  const sorted = useMemo(() => {
    const copy = [...entries];
    switch (sortKey) {
      case 'stars':
        return copy.sort((a, b) => totalStars(b) - totalStars(a));
      case 'createdAt':
        return copy.sort((a, b) => b.createdAt - a.createdAt);
      case 'nickname':
        return copy.sort((a, b) => a.nickname.localeCompare(b.nickname));
      case 'shop':
        return copy.sort((a, b) => a.shop.localeCompare(b.shop));
    }
  }, [entries, sortKey]);

  function handleCardClick(entry: DressEntry) {
    if (!compareMode) {
      setSelected(entry);
      return;
    }
    setCompareSelecting((prev) => {
      if (prev.some((e) => e.id === entry.id)) {
        return prev.filter((e) => e.id !== entry.id);
      }
      if (prev.length >= 2) return prev;
      return [...prev, entry];
    });
  }

  function openCompare() {
    if (compareSelecting.length === 2) {
      setCompareSelection([compareSelecting[0], compareSelecting[1]]);
    }
  }

  function exitCompareMode() {
    setCompareMode(false);
    setCompareSelecting([]);
    setCompareSelection(null);
  }

  async function handleJsonExport() {
    try {
      const json = await exportAllToJson(meta, entries);
      await downloadJsonFile(json);
    } catch {
      alert('JSON 내보내기에 실패했습니다.');
    }
  }

  async function handlePngExport() {
    try {
      const blob = await exportSummaryGridToPng(
        entries,
        meta?.basePhoto ?? null,
        photoRef.current.w,
        photoRef.current.h,
      );
      await downloadPngBlob(blob);
    } catch {
      alert('이미지 내보내기는 브라우저에서만 지원됩니다.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur border-b border-ink-100/60 shrink-0">
        <div className="mx-auto max-w-5xl flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="btn-ghost p-1 -ml-1 text-xl leading-none"
            aria-label="홈으로"
          >
            ←
          </button>
          <h1 className="text-lg font-bold text-ink-900 flex-1">요약</h1>
          <button
            onClick={() => {
              if (compareMode) {
                exitCompareMode();
              } else {
                setCompareMode(true);
                setCompareSelecting([]);
              }
            }}
            className={[
              'text-sm px-3 py-1.5 rounded-xl font-medium transition-colors',
              compareMode
                ? 'btn-primary'
                : 'border border-ink-100/60 text-ink-400 hover:bg-cream-100',
            ].join(' ')}
            aria-pressed={compareMode}
          >
            비교
          </button>
        </div>
      </header>

      {/* Compare action bar */}
      {compareMode && (
        <div className="flex items-center justify-between px-4 py-2 bg-rose-50 border-b border-rose-100 text-sm">
          <span className="text-rose-600">
            {compareSelecting.length === 0
              ? '비교할 드레스 2개를 선택하세요'
              : compareSelecting.length === 1
              ? '1개 선택됨. 하나 더 선택하세요.'
              : '2개 선택됨.'}
          </span>
          <button
            onClick={openCompare}
            disabled={compareSelecting.length < 2}
            className="btn-primary px-3 py-1 text-sm disabled:opacity-40"
          >
            비교하기
          </button>
        </div>
      )}

      <main className="flex-1 overflow-auto px-4 py-4">
        <div className="mx-auto max-w-5xl space-y-4">
          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <label className="label-caps" htmlFor="sort-select">
              정렬
            </label>
            <select
              id="sort-select"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm bg-cream-50 border border-ink-100/60 rounded-xl px-2 py-1"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Entry grid */}
          {sorted.length === 0 ? (
            <div className="mx-auto max-w-2xl py-12">
              <div className="card p-12 text-center">
                <div className="text-4xl mb-4">🤍</div>
                <p className="font-medium text-ink-900 mb-1">아직 드레스가 없어요</p>
                <p className="text-sm text-ink-400">홈에서 새 드레스를 추가해 보세요.</p>
                <button onClick={() => navigate('/')} className="btn-primary mt-6 text-sm">
                  홈으로
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {sorted.map((entry) => {
                const isSelected = compareSelecting.some((e) => e.id === entry.id);
                return (
                  <div
                    key={entry.id}
                    className={[
                      'relative',
                      compareMode && isSelected ? 'ring-2 ring-rose-400 rounded-2xl' : '',
                    ].join(' ')}
                  >
                    <EntryCard entry={entry} onClick={() => handleCardClick(entry)} />
                    {compareMode && isSelected && (
                      <span className="absolute top-1 right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {compareSelecting.findIndex((e) => e.id === entry.id) + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-around px-4 py-3 bg-cream-50/80 border-t border-ink-100/60 shrink-0">
        <button
          onClick={handlePngExport}
          className="btn-ghost text-sm"
        >
          이미지로 내보내기
        </button>
        <span className="text-ink-100">·</span>
        <button
          onClick={handleJsonExport}
          className="btn-ghost text-sm"
        >
          JSON 받기
        </button>
      </footer>

      {selected && (
        <SummaryDetailModal entry={selected} onClose={() => setSelected(null)} />
      )}

      {compareSelection && (
        <CompareModal
          entryA={compareSelection[0]}
          entryB={compareSelection[1]}
          photo={meta?.basePhoto ?? null}
          photoWidth={photoRef.current.w}
          photoHeight={photoRef.current.h}
          onClose={() => setCompareSelection(null)}
        />
      )}
    </div>
  );
}
