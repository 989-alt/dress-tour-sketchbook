import { useMemo } from 'react';
import { composeDress } from '../lib/compose';
import type { DressEntry } from '../types';

interface EntryCardProps {
  entry: DressEntry;
  onClick?: () => void;
}

const CARD_W = 120;
const CARD_H = 240;

export function EntryCard({ entry, onClick }: EntryCardProps) {
  const totalStars = Object.values(entry.ratings).reduce((sum, v) => sum + v, 0);

  const dressSvg = useMemo(
    () => composeDress(entry, entry.anchors, { photoWidth: CARD_W, photoHeight: CARD_H, idPrefix: `card-${entry.id}-` }),
    [entry]
  );

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden text-left w-full"
    >
      {/* Mini dress render */}
      <div className="bg-gray-50 w-full flex items-center justify-center py-2">
        {dressSvg}
      </div>

      <div className="px-2 py-2 w-full">
        <p className="text-sm font-medium text-gray-800 truncate">
          {entry.nickname || '이름 없음'}
        </p>
        <p className="text-xs text-yellow-500">⭐ {totalStars}</p>
        {entry.shop && (
          <p className="text-xs text-gray-400 truncate">{entry.shop}</p>
        )}
      </div>
    </button>
  );
}
