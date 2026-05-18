type BrushSize = 'thin' | 'medium' | 'thick';
type PenColor = 'black' | 'navy' | 'red';

interface PenPanelProps {
  brushSize: BrushSize;
  color: PenColor;
  eraser: boolean;
  acceptFinger: boolean;
  onBrushSizeChange: (s: BrushSize) => void;
  onColorChange: (c: PenColor) => void;
  onEraserChange: (e: boolean) => void;
  onAcceptFingerChange: (f: boolean) => void;
  onUndo: () => void;
  onClear: () => void;
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
  eraser,
  acceptFinger,
  onBrushSizeChange,
  onColorChange,
  onEraserChange,
  onAcceptFingerChange,
  onUndo,
  onClear,
}: PenPanelProps) {
  return (
    <div className="space-y-4">
      {/* Brush size */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1.5">펜 굵기</p>
        <div className="flex gap-1">
          {BRUSH_SIZES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onBrushSizeChange(id)}
              data-brush={id}
              className={[
                'flex-1 py-1 text-xs rounded border transition-colors',
                brushSize === id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1.5">색상</p>
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
                color === id ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105',
              ].join(' ')}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {/* Eraser + Finger toggles */}
      <div className="space-y-2">
        <button
          onClick={() => onEraserChange(!eraser)}
          className={[
            'w-full py-1.5 text-sm rounded border transition-colors',
            eraser
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600',
          ].join(' ')}
          aria-pressed={eraser}
          data-testid="eraser-toggle"
        >
          {eraser ? '지우개 켜짐' : '지우개'}
        </button>
        <button
          onClick={() => onAcceptFingerChange(!acceptFinger)}
          className={[
            'w-full py-1.5 text-sm rounded border transition-colors',
            acceptFinger
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600',
          ].join(' ')}
          aria-pressed={acceptFinger}
          data-testid="finger-toggle"
        >
          {acceptFinger ? '손가락 그리기 켜짐' : '손가락 그리기'}
        </button>
      </div>

      {/* Undo + Clear */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          className="flex-1 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
        >
          실행 취소
        </button>
        <button
          onClick={onClear}
          className="flex-1 py-1.5 text-sm rounded border border-red-300 bg-white hover:bg-red-50 text-red-600"
        >
          지우기
        </button>
      </div>
    </div>
  );
}
