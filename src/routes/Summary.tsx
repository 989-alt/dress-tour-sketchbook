import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { EntryCard } from '../components/EntryCard';
import { SummaryDetailModal } from '../components/SummaryDetailModal';
import type { DressEntry } from '../types';

type SortKey = 'stars' | 'createdAt' | 'nickname' | 'shop';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'stars', label: '별점 합' },
  { value: 'createdAt', label: '작성 시간' },
  { value: 'nickname', label: '별명' },
  { value: 'shop', label: '매장' },
];

function totalStars(entry: DressEntry): number {
  return Object.values(entry.ratings).reduce((sum, v) => sum + v, 0);
}

export default function Summary() {
  const navigate = useNavigate();
  const entries = useAppStore((s) => s.entries);
  const [sortKey, setSortKey] = useState<SortKey>('stars');
  const [selected, setSelected] = useState<DressEntry | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-800 text-xl leading-none"
          aria-label="홈으로"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-800">요약</h1>
      </header>

      <main className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium" htmlFor="sort-select">
            정렬
          </label>
          <select
            id="sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white"
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
          <p className="text-sm text-gray-400 text-center py-12">아직 드레스가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sorted.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={() => setSelected(entry)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-around px-4 py-3 bg-white border-t border-gray-200 shrink-0">
        <button
          onClick={() => alert('T21에서 구현 예정')}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          이미지로 내보내기
        </button>
        <button
          onClick={() => alert('T21에서 구현 예정')}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          JSON 받기
        </button>
      </footer>

      {selected && (
        <SummaryDetailModal entry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
