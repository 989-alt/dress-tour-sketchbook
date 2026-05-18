import type { ColorEnum } from '../../types';
import { COLOR_HEX, COLOR_LABELS } from '../../lib/colorPalette';
import { COLOR_SHORT } from '../../lib/glossary';

const COLOR_ORDER: ColorEnum[] = [
  'pureWhite', 'offWhite', 'ivory', 'champagne', 'blush',
  'gold', 'grey', 'blue', 'black',
];

interface ColorValue {
  primary: ColorEnum;
  gradient: 'solid' | 'ombre';
  secondary?: ColorEnum;
  accent: ColorEnum;
}

interface ColorPanelProps {
  value: ColorValue;
  onChange: (next: ColorValue) => void;
}

interface SwatchRowProps {
  selected: ColorEnum | undefined;
  'data-section': string;
  onSelect: (c: ColorEnum) => void;
}

function ColorSwatch({
  color,
  selected,
  section,
  onSelect,
}: {
  color: ColorEnum;
  selected: boolean;
  section: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-section={section}
      data-color={color}
      onClick={onSelect}
      className="flex flex-col items-center gap-0.5 p-1 rounded border transition-colors text-center"
      style={{
        borderColor: selected ? '#3b82f6' : '#d1d5db',
        backgroundColor: selected ? '#eff6ff' : 'transparent',
      }}
    >
      <div
        className="w-7 h-7 rounded-full border border-gray-200"
        style={{ backgroundColor: COLOR_HEX[color] }}
        aria-label={COLOR_LABELS[color]}
      />
      <span className="text-xs text-gray-700 leading-tight" style={{ fontSize: '10px' }}>
        {COLOR_LABELS[color]}
      </span>
      <span className="text-gray-400 leading-tight" style={{ fontSize: '9px' }}>
        {COLOR_SHORT[color]}
      </span>
    </button>
  );
}

function SwatchRow({ selected, 'data-section': section, onSelect }: SwatchRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_ORDER.map((color) => (
        <ColorSwatch
          key={color}
          color={color}
          selected={color === selected}
          section={section}
          onSelect={() => onSelect(color)}
        />
      ))}
    </div>
  );
}

export function ColorPanel({ value, onChange }: ColorPanelProps) {
  function setPrimary(primary: ColorEnum) {
    onChange({ ...value, primary });
  }

  function setGradient(gradient: 'solid' | 'ombre') {
    const next: ColorValue = { ...value, gradient };
    if (gradient === 'solid') {
      delete next.secondary;
    }
    onChange(next);
  }

  function setSecondary(secondary: ColorEnum) {
    onChange({ ...value, secondary });
  }

  function setAccent(accent: ColorEnum) {
    onChange({ ...value, accent });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Primary */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">메인 색상</p>
        <SwatchRow
          selected={value.primary}
          data-section="primary"
          onSelect={setPrimary}
        />
      </div>

      {/* Gradient toggle */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">그라데이션</p>
        <div className="flex gap-2 mb-3">
          {(['solid', 'ombre'] as const).map((g) => (
            <button
              key={g}
              type="button"
              data-gradient={g}
              onClick={() => setGradient(g)}
              className={[
                'px-3 py-1 rounded border text-xs transition-colors',
                value.gradient === g
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {g === 'solid' ? '단색' : '옴브레'}
            </button>
          ))}
        </div>

        {value.gradient === 'ombre' && (
          <div>
            <p className="text-xs text-gray-500 mb-2">보조 색상</p>
            <SwatchRow
              selected={value.secondary}
              data-section="secondary"
              onSelect={setSecondary}
            />
          </div>
        )}
      </div>

      {/* Accent */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">액센트 색상</p>
        <SwatchRow
          selected={value.accent}
          data-section="accent"
          onSelect={setAccent}
        />
      </div>
    </div>
  );
}
