import type { ColorEnum } from '../../types';
import { COLOR_HEX, COLOR_LABELS } from '../../lib/colorPalette';

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

function SwatchRow({ selected, 'data-section': section, onSelect }: SwatchRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_ORDER.map((color) => {
        const isSelected = color === selected;
        return (
          <button
            key={color}
            data-section={section}
            data-color={color}
            title={COLOR_LABELS[color]}
            onClick={() => onSelect(color)}
            className={[
              'w-7 h-7 rounded-full border-2 transition-colors',
              isSelected ? 'border-blue-500 ring-1 ring-blue-400' : 'border-gray-300',
            ].join(' ')}
            style={{ backgroundColor: COLOR_HEX[color] }}
          />
        );
      })}
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
