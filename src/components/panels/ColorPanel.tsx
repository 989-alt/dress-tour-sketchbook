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
        borderColor: selected ? '#f08080' : '#e5e0d8',
        backgroundColor: selected ? '#fff0f0' : 'transparent',
      }}
    >
      <div
        className="w-7 h-7 rounded-full border border-ink-100/60"
        style={{ backgroundColor: COLOR_HEX[color] }}
        aria-label={COLOR_LABELS[color]}
      />
      <span className="text-xs text-ink-900 leading-tight" style={{ fontSize: '10px' }}>
        {COLOR_LABELS[color]}
      </span>
      <span className="text-ink-400 leading-tight" style={{ fontSize: '9px' }}>
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
        <p className="label-caps mb-2">메인 색상</p>
        <SwatchRow
          selected={value.primary}
          data-section="primary"
          onSelect={setPrimary}
        />
      </div>

      {/* Gradient toggle */}
      <div>
        <p className="label-caps mb-2">그라데이션</p>
        <div className="flex gap-2 mb-3">
          {(['solid', 'ombre'] as const).map((g) => (
            <button
              key={g}
              type="button"
              data-gradient={g}
              onClick={() => setGradient(g)}
              className={[
                'px-3 py-1 rounded-xl border text-xs transition-colors',
                value.gradient === g
                  ? 'border-rose-400 bg-rose-50 text-rose-600'
                  : 'border-ink-100/60 bg-cream-50 text-ink-900 hover:bg-cream-100',
              ].join(' ')}
            >
              {g === 'solid' ? '단색' : '옴브레'}
            </button>
          ))}
        </div>

        {value.gradient === 'ombre' && (
          <div>
            <p className="label-caps mb-2">보조 색상</p>
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
        <p className="label-caps mb-2">액센트 색상</p>
        <SwatchRow
          selected={value.accent}
          data-section="accent"
          onSelect={setAccent}
        />
      </div>
    </div>
  );
}
