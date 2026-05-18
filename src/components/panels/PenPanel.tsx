import { useState } from 'react';
import type { RegionPrompt } from '../../types';

type BrushSize = 'thin' | 'medium' | 'thick';
type PenColor = 'black' | 'navy' | 'red';

interface PenPanelProps {
  brushSize: BrushSize;
  color: PenColor;
  acceptFinger: boolean;
  onBrushSizeChange: (s: BrushSize) => void;
  onColorChange: (c: PenColor) => void;
  onAcceptFingerChange: (f: boolean) => void;
  onUndo: () => void;
  onClearInProgress: () => void;
  onFinishRegion: () => string | null;
  savedRegions: RegionPrompt[];
  onRegionAdd: (region: RegionPrompt) => void;
  onRegionDelete: (id: string) => void;
}

const BRUSH_SIZES: Array<{ id: BrushSize; label: string }> = [
  { id: 'thin', label: '얇게' },
  { id: 'medium', label: '중간' },
  { id: 'thick', label: '굵게' },
];

const COLORS: Array<{ id: PenColor; hex: string; label: string }> = [
  { id: 'black', hex: '#222222', label: '검정' },
  { id: 'navy', hex: '#1a3a72', label: '네이비' },
  { id: 'red', hex: '#c0392b', label: '빨강' },
];

export function PenPanel({
  brushSize,
  color,
  acceptFinger,
  onBrushSizeChange,
  onColorChange,
  onAcceptFingerChange,
  onUndo,
  onClearInProgress,
  onFinishRegion,
  savedRegions,
  onRegionAdd,
  onRegionDelete,
}: PenPanelProps) {
  const [pendingPathData, setPendingPathData] = useState<string | null>(null);
  const [promptText, setPromptText] = useState('');

  function handleFinishRegion() {
    const pathData = onFinishRegion();
    if (!pathData) return;
    setPendingPathData(pathData);
    setPromptText('');
  }

  function handleSaveRegion() {
    if (!pendingPathData) return;
    const newRegion: RegionPrompt = {
      id: crypto.randomUUID(),
      pathData: pendingPathData,
      prompt: promptText,
      hue: (savedRegions.length * 60) % 360,
      createdAt: Date.now(),
    };
    onRegionAdd(newRegion);
    setPendingPathData(null);
    setPromptText('');
  }

  function handleCancelRegion() {
    setPendingPathData(null);
    setPromptText('');
  }

  return (
    <div className="space-y-4">
      {/* Brush size */}
      <div>
        <p className="label-caps mb-1.5">펜 굵기</p>
        <div className="flex gap-1">
          {BRUSH_SIZES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onBrushSizeChange(id)}
              data-brush={id}
              className={[
                'flex-1 py-1 text-xs rounded-xl border transition-colors',
                brushSize === id
                  ? 'border-rose-400 bg-rose-50 text-rose-600'
                  : 'border-ink-100/60 bg-cream-50 hover:bg-cream-100 text-ink-400',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="label-caps mb-1.5">색상</p>
        <div className="flex gap-2">
          {COLORS.map(({ id, hex, label }) => (
            <button
              key={id}
              onClick={() => onColorChange(id)}
              data-color={id}
              aria-label={label}
              title={label}
              className={[
                'w-8 h-8 rounded-full border-2 transition-transform',
                color === id ? 'border-rose-400 scale-110' : 'border-transparent hover:scale-105',
              ].join(' ')}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {/* Finger toggle */}
      <button
        onClick={() => onAcceptFingerChange(!acceptFinger)}
        className={[
          'w-full py-1.5 text-sm rounded-xl border transition-colors',
          acceptFinger
            ? 'border-rose-400 bg-rose-50 text-rose-600'
            : 'border-ink-100/60 bg-cream-50 hover:bg-cream-100 text-ink-400',
        ].join(' ')}
        aria-pressed={acceptFinger}
        data-testid="finger-toggle"
      >
        {acceptFinger ? '손가락 그리기 켜짐' : '손가락 그리기'}
      </button>

      {/* Undo + Clear in-progress */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          className="flex-1 py-1.5 text-sm rounded-xl border border-ink-100/60 bg-cream-50 hover:bg-cream-100 text-ink-900"
        >
          실행 취소
        </button>
        <button
          onClick={onClearInProgress}
          className="flex-1 py-1.5 text-sm rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600"
        >
          전체 취소
        </button>
      </div>

      {/* Finish region button */}
      <button
        onClick={handleFinishRegion}
        data-testid="finish-region"
        className="btn-primary w-full py-2 text-sm font-medium"
      >
        ✓ 이 영역 완료
      </button>

      {/* Inline prompt entry after finish */}
      {pendingPathData && (
        <div className="border border-ink-100/60 rounded-xl p-3 bg-cream-50 space-y-2" data-testid="prompt-form">
          <p className="text-xs text-ink-400">이 영역에 적용할 변경 사항을 입력하세요</p>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="예: 여기에 레이스 추가"
            rows={2}
            aria-label="영역 프롬프트 입력"
            className="w-full text-xs bg-cream-50 border border-ink-100/60 rounded-xl px-2 py-1 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveRegion}
              data-testid="save-region"
              className="btn-primary flex-1 py-1.5 text-xs"
            >
              저장
            </button>
            <button
              onClick={handleCancelRegion}
              data-testid="cancel-region"
              className="flex-1 py-1.5 text-xs rounded-xl border border-ink-100/60 bg-cream-50 hover:bg-cream-100 text-ink-400"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Saved regions list */}
      {savedRegions.length > 0 && (
        <div className="space-y-1.5" data-testid="saved-regions-list">
          <p className="label-caps">저장된 영역</p>
          {savedRegions.map((region, idx) => (
            <div
              key={region.id}
              className="flex items-start gap-2 text-xs bg-cream-50 border-l-4 border-ink-100/60 rounded px-2 py-1.5"
              style={{ borderLeftColor: `hsl(${region.hue}, 55%, 65%)` }}
              data-testid={`saved-region-${region.id}`}
            >
              <span className="flex-1 text-ink-900 min-w-0 break-words">
                영역 {idx + 1}{region.prompt ? `: "${region.prompt}"` : ''}
              </span>
              <button
                onClick={() => onRegionDelete(region.id)}
                aria-label={`영역 ${idx + 1} 삭제`}
                className="shrink-0 text-ink-400 hover:text-rose-500 leading-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
