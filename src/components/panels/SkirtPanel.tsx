import type { SkirtTexture, SlitType, TrainLength } from '../../types';
import { TEXTURES } from '../../parts/skirts';
import { SKIRT_TEXTURE_GLOSSARY, TRAIN_GLOSSARY } from '../../lib/glossary';

const TEXTURE_ORDER: SkirtTexture[] = [
  'smooth', 'gathered', 'pleated', 'tiered',
  'layeredTulle', 'ruffled', 'ruched', 'asymmetricDrape',
];

const SLIT_TYPES: Array<{ key: SlitType; label: string }> = [
  { key: 'none',  label: '없음'   },
  { key: 'side',  label: '사이드' },
  { key: 'front', label: '프론트' },
];

const TRAIN_ORDER: Array<{ key: TrainLength; label: string }> = [
  { key: 'none',      label: '없음'     },
  { key: 'sweep',     label: '스윕'     },
  { key: 'court',     label: '코트'     },
  { key: 'chapel',    label: '채플'     },
  { key: 'cathedral', label: '캐서드럴' },
];

const HEIGHT_VALUES = [0, 1, 2, 3, 4, 5] as const;
const LAYER_VALUES  = [2, 3, 4, 5] as const;

interface SkirtValue {
  texture: SkirtTexture;
  layers: 2 | 3 | 4 | 5;
  slit: { type: SlitType; height: 0 | 1 | 2 | 3 | 4 | 5 };
  train: TrainLength;
}

interface SkirtPanelProps {
  value: SkirtValue;
  onChange: (next: SkirtValue) => void;
}

export function SkirtPanel({ value, onChange }: SkirtPanelProps) {
  const chip = (active: boolean) =>
    [
      'px-2 py-1 rounded border text-xs transition-colors',
      active
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ].join(' ');

  return (
    <div className="flex flex-col gap-4">
      {/* Texture */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1">텍스처</p>
        <div className="flex flex-wrap gap-2">
          {TEXTURE_ORDER.map((t) => (
            <button
              key={t}
              data-texture={t}
              onClick={() => onChange({ ...value, texture: t })}
              title={SKIRT_TEXTURE_GLOSSARY[t]}
              className={chip(t === value.texture)}
            >
              {TEXTURES[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Tiered layers — only when texture=tiered */}
      {value.texture === 'tiered' && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">티어드 단 수</p>
          <div className="flex gap-2">
            {LAYER_VALUES.map((n) => (
              <button
                key={n}
                data-layers={n}
                onClick={() => onChange({ ...value, layers: n })}
                className={chip(n === value.layers)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Slit */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1">슬릿</p>
        <div className="flex gap-2 mb-2">
          {SLIT_TYPES.map(({ key, label }) => (
            <button
              key={key}
              data-slit-type={key}
              onClick={() => onChange({ ...value, slit: { ...value.slit, type: key } })}
              className={chip(key === value.slit.type)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-1">높이</p>
        <div className="flex gap-2">
          {HEIGHT_VALUES.map((h) => (
            <button
              key={h}
              data-slit-height={h}
              onClick={() => onChange({ ...value, slit: { ...value.slit, height: h } })}
              className={chip(h === value.slit.height)}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Train */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1">트레인</p>
        <div className="flex flex-wrap gap-2">
          {TRAIN_ORDER.map(({ key, label }) => (
            <button
              key={key}
              data-train={key}
              onClick={() => onChange({ ...value, train: key })}
              title={TRAIN_GLOSSARY[key]}
              className={chip(key === value.train)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
