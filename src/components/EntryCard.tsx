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
      className="card flex flex-col items-center hover:shadow-paper-hover hover:-translate-y-px transition-all overflow-hidden text-left w-full"
    >
      {/* Mini dress render — AI image takes priority when available */}
      <div className="bg-cream-100 w-full flex items-center justify-center py-2">
        {entry.aiResult?.dataUrl ? (
          <img
            src={entry.aiResult.dataUrl}
            alt={entry.nickname || '이름 없음'}
            className="w-full h-full object-cover"
            style={{ width: CARD_W, height: CARD_H }}
          />
        ) : (
          dressSvg
        )}
      </div>

      <div className="px-2 py-2 w-full">
        <p className="text-sm font-medium text-ink-900 truncate">
          {entry.nickname || '이름 없음'}
        </p>
        <p className="text-xs text-gold">⭐ {totalStars}</p>
        {entry.shop && (
          <p className="text-xs text-ink-400 truncate">{entry.shop}</p>
        )}
      </div>
    </button>
  );
}
