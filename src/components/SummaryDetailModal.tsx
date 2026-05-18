import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { DressCanvas } from './DressCanvas';
import type { DressEntry } from '../types';
import { useWakeLock } from '../lib/wakeLock';

interface Props {
  entry: DressEntry;
  onClose: () => void;
}

const RATING_LABELS: Record<string, string> = {
  firstImpression: '첫인상',
  fit: '핏',
  comfort: '편안함',
  weddingFeel: '웨딩 느낌',
};

export function SummaryDetailModal({ entry, onClose }: Props) {
  const meta = useAppStore((s) => s.meta);
  const [photoDims, setPhotoDims] = useState({ w: 400, h: 800 });
  const backdropRef = useRef<HTMLDivElement>(null);

  // Keep screen awake while viewing dress detail
  useWakeLock(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Use stored photo dims if available
  useEffect(() => {
    if (!meta?.basePhoto) return;
    let cancelled = false;
    createImageBitmap(meta.basePhoto).then((bmp) => {
      if (!cancelled) setPhotoDims({ w: bmp.width, h: bmp.height });
      bmp.close();
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [meta?.basePhoto]);

  const totalStars = Object.values(entry.ratings).reduce((sum, v) => sum + v, 0);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-auto py-8"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 flex flex-col gap-5">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl leading-none"
          aria-label="닫기"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-gray-800">
          {entry.nickname || '이름 없음'}
        </h2>

        {/* Dress canvas */}
        {meta?.basePhoto && (
          <div className="w-48 mx-auto">
            <DressCanvas
              photo={meta.basePhoto}
              photoWidth={photoDims.w}
              photoHeight={photoDims.h}
              entry={entry}
              anchors={entry.anchors}
              showAnchors={false}
              showSketch={false}
            />
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {entry.shop && (
            <div>
              <span className="text-gray-400">매장 </span>
              <span className="text-gray-800">{entry.shop}</span>
            </div>
          )}
          {entry.dressNo && (
            <div>
              <span className="text-gray-400">번호 </span>
              <span className="text-gray-800">{entry.dressNo}</span>
            </div>
          )}
          {entry.lightingNote && (
            <div className="col-span-2">
              <span className="text-gray-400">조명 메모 </span>
              <span className="text-gray-800">{entry.lightingNote}</span>
            </div>
          )}
        </div>

        {/* Ratings */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">별점 합계 {totalStars}점</p>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {(Object.entries(entry.ratings) as [string, number][]).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1">
                <span className="text-gray-500 w-20">{RATING_LABELS[key] ?? key}</span>
                <span className="text-yellow-500">{'⭐'.repeat(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quotes */}
        {(entry.quotes.bride || entry.quotes.groom) && (
          <div className="space-y-1 text-sm">
            {entry.quotes.bride && (
              <p><span className="text-gray-400">신부 </span><span className="text-gray-800">"{entry.quotes.bride}"</span></p>
            )}
            {entry.quotes.groom && (
              <p><span className="text-gray-400">신랑 </span><span className="text-gray-800">"{entry.quotes.groom}"</span></p>
            )}
          </div>
        )}

        {/* Pros / Cons */}
        {(entry.pros.length > 0 || entry.cons.length > 0) && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {entry.pros.length > 0 && (
              <div>
                <p className="font-medium text-green-700 mb-1">장점</p>
                <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                  {entry.pros.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
            {entry.cons.length > 0 && (
              <div>
                <p className="font-medium text-red-600 mb-1">단점</p>
                <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                  {entry.cons.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Categorical notes */}
        {Object.values(entry.categorical).some((arr) => arr.length > 0) && (
          <div className="text-sm space-y-1">
            <p className="font-medium text-gray-600 mb-1">카테고리 메모</p>
            {entry.categorical.necklineNotes.length > 0 && (
              <p><span className="text-gray-400">넥라인 </span>{entry.categorical.necklineNotes.join(', ')}</p>
            )}
            {entry.categorical.sleeveNotes.length > 0 && (
              <p><span className="text-gray-400">소매 </span>{entry.categorical.sleeveNotes.join(', ')}</p>
            )}
            {entry.categorical.backNotes.length > 0 && (
              <p><span className="text-gray-400">등 </span>{entry.categorical.backNotes.join(', ')}</p>
            )}
            {entry.categorical.fabricNotes.length > 0 && (
              <p><span className="text-gray-400">소재 </span>{entry.categorical.fabricNotes.join(', ')}</p>
            )}
            {entry.categorical.trainNotes.length > 0 && (
              <p><span className="text-gray-400">트레인 </span>{entry.categorical.trainNotes.join(', ')}</p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="self-end px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
