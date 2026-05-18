import type { SkirtTexture, SlitType, TrainLength } from '../../types';
import { TEXTURES } from '../../parts/skirts';
import { SKIRT_TEXTURE_SHORT, SLIT_SHORT, TRAIN_SHORT } from '../../lib/glossary';
import { PreviewChip } from '../PreviewChip';
import { previewUrl } from '../../lib/previewImages';

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

function numericChip(active: boolean) {
  return [
    'px-2 py-1 rounded-xl border text-xs transition-colors',
    active
      ? 'border-rose-400 bg-rose-50 text-rose-600'
      : 'border-ink-100/60 bg-cream-50 text-ink-900 hover:bg-cream-100',
  ].join(' ');
}

export function SkirtPanel({ value, onChange }: SkirtPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Texture */}
      <div>
        <p className="label-caps mb-1">텍스처</p>
        <div className="grid grid-cols-3 gap-2">
          {TEXTURE_ORDER.map((t) => (
            <PreviewChip
              key={t}
              selected={t === value.texture}
              onClick={() => onChange({ ...value, texture: t })}
              label={TEXTURES[t].label}
              description={SKIRT_TEXTURE_SHORT[t]}
              previewSrc={previewUrl('skirtTexture', t)}
              dataAttrs={{ 'data-texture': t }}
            />
          ))}
        </div>
      </div>

      {/* Tiered layers — only when texture=tiered */}
      {value.texture === 'tiered' && (
        <div>
          <p className="label-caps mb-1">티어드 단 수</p>
          <div className="flex gap-2">
            {LAYER_VALUES.map((n) => (
              <button
                key={n}
                type="button"
                data-layers={n}
                onClick={() => onChange({ ...value, layers: n })}
                className={numericChip(n === value.layers)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Slit */}
      <div>
        <p className="label-caps mb-1">슬릿</p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {SLIT_TYPES.map(({ key, label }) => (
            <PreviewChip
              key={key}
              selected={key === value.slit.type}
              onClick={() => onChange({ ...value, slit: { ...value.slit, type: key } })}
              label={label}
              description={SLIT_SHORT[key]}
              previewSrc={previewUrl('slit', key)}
              dataAttrs={{ 'data-slit-type': key }}
            />
          ))}
        </div>
        <p className="label-caps mb-1">높이</p>
        <div className="flex gap-2">
          {HEIGHT_VALUES.map((h) => (
            <button
              key={h}
              type="button"
              data-slit-height={h}
              onClick={() => onChange({ ...value, slit: { ...value.slit, height: h } })}
              className={numericChip(h === value.slit.height)}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Train */}
      <div>
        <p className="label-caps mb-1">트레인</p>
        <div className="grid grid-cols-3 gap-2">
          {TRAIN_ORDER.map(({ key, label }) => (
            <PreviewChip
              key={key}
              selected={key === value.train}
              onClick={() => onChange({ ...value, train: key })}
              label={label}
              description={TRAIN_SHORT[key]}
              previewSrc={previewUrl('train', key)}
              dataAttrs={{ 'data-train': key }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
