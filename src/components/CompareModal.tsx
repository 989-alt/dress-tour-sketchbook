import { useEffect, useRef, useState } from 'react';
import { DressCanvas } from './DressCanvas';
import type { DressEntry } from '../types';
import { loadImageWithCorrectOrientation } from '../lib/exif';

interface CompareModalProps {
  entryA: DressEntry;
  entryB: DressEntry;
  photo: Blob | null;
  photoWidth: number;
  photoHeight: number;
  onClose: () => void;
}

function totalStars(entry: DressEntry): number {
  return Object.values(entry.ratings).reduce((sum, v) => sum + v, 0);
}

function EntryColumn({
  entry,
  photo,
  photoWidth,
  photoHeight,
}: {
  entry: DressEntry;
  photo: Blob | null;
  photoWidth: number;
  photoHeight: number;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
      {photo && (
        <div className="w-36">
          <DressCanvas
            photo={photo}
            photoWidth={photoWidth}
            photoHeight={photoHeight}
            entry={entry}
            anchors={entry.anchors}
            showAnchors={false}
            showSketch={false}
          />
        </div>
      )}
      <p className="font-semibold text-gray-800 text-sm text-center truncate w-full px-1">
        {entry.nickname || '이름 없음'}
      </p>
      {entry.shop && (
        <p className="text-xs text-gray-500 text-center">{entry.shop}</p>
      )}
      <p className="text-yellow-500 text-sm">⭐ {totalStars(entry)}</p>
      {entry.dressNo && (
        <p className="text-xs text-gray-400">No. {entry.dressNo}</p>
      )}
      {(entry.pros.length > 0 || entry.cons.length > 0) && (
        <div className="w-full text-xs space-y-1 px-1">
          {entry.pros.length > 0 && (
            <p className="text-green-700 font-medium">
              장점: {entry.pros.slice(0, 2).join(', ')}
              {entry.pros.length > 2 && ' …'}
            </p>
          )}
          {entry.cons.length > 0 && (
            <p className="text-red-600 font-medium">
              단점: {entry.cons.slice(0, 2).join(', ')}
              {entry.cons.length > 2 && ' …'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function CompareModal({
  entryA,
  entryB,
  photo,
  photoWidth: initialW,
  photoHeight: initialH,
  onClose,
}: CompareModalProps) {
  const [photoDims, setPhotoDims] = useState({ w: initialW, h: initialH });
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!photo) return;
    let cancelled = false;
    loadImageWithCorrectOrientation(photo)
      .then(({ width, height }) => {
        if (!cancelled) setPhotoDims({ w: width, h: height });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [photo]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-auto py-8"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="드레스 비교"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl leading-none"
          aria-label="닫기"
        >
          ✕
        </button>

        <h2 className="text-base font-semibold text-gray-800 mb-4 text-center">드레스 비교</h2>

        <div className="flex gap-4 items-start">
          <EntryColumn
            entry={entryA}
            photo={photo}
            photoWidth={photoDims.w}
            photoHeight={photoDims.h}
          />
          <div className="w-px bg-gray-200 self-stretch" />
          <EntryColumn
            entry={entryB}
            photo={photo}
            photoWidth={photoDims.w}
            photoHeight={photoDims.h}
          />
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
