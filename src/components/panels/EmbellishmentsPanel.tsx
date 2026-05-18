import { useState } from 'react';
import type { Embellishment, EmbellishmentType, Region, ColorEnum } from '../../types';
import { EMBELLISHMENTS } from '../../parts/embellishments';
import { EMBELLISHMENT_SHORT } from '../../lib/glossary';
import { PreviewChip } from '../PreviewChip';
import { previewUrl } from '../../lib/previewImages';

const TYPE_ORDER: EmbellishmentType[] = [
  'beads', 'laceApplique', 'threeDFlorals', 'crystals', 'pearls',
  'embroidery', 'sequins', 'ribbons', 'decorativeButtons',
];

const REGION_LABELS: Record<Region, string> = {
  bodice:  '상의',
  waist:   '허리',
  skirt:   '치마',
  sleeves: '소매',
  train:   '트레인',
  allover: '전체',
};

const REGIONS: Region[] = ['bodice', 'waist', 'skirt', 'sleeves', 'train', 'allover'];
const INTENSITIES = [0, 1, 2, 3, 4, 5] as const;

interface EmbellishmentsPanelProps {
  value: Embellishment[];
  accentColor: ColorEnum;
  onChange: (next: Embellishment[]) => void;
}

function chip(active: boolean) {
  return [
    'px-2 py-1 rounded-xl border text-xs transition-colors',
    active
      ? 'border-rose-400 bg-rose-50 text-rose-600'
      : 'border-ink-100/60 bg-cream-50 text-ink-900 hover:bg-cream-100',
  ].join(' ');
}

/** Render extra controls for types that have them. */
function ExtraControls({
  emb,
  onExtraChange,
}: {
  emb: Embellishment;
  onExtraChange: (extra: Record<string, unknown>) => void;
}) {
  const extra = emb.extra ?? {};

  if (emb.type === 'threeDFlorals') {
    const sizes = ['S', 'M', 'L'] as const;
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-ink-400">크기:</span>
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            data-size={s}
            onClick={() => onExtraChange({ ...extra, size: s })}
            className={chip(extra.size === s || (!extra.size && s === 'M'))}
          >
            {s}
          </button>
        ))}
      </div>
    );
  }

  if (emb.type === 'embroidery') {
    const styles = [
      { key: 'floral', label: '플로럴' },
      { key: 'geometric', label: '기하학' },
      { key: 'none', label: '없음' },
    ] as const;
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-ink-400">스타일:</span>
        {styles.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            data-style={key}
            onClick={() => onExtraChange({ ...extra, style: key })}
            className={chip(extra.style === key || (!extra.style && key === 'floral'))}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  if (emb.type === 'ribbons') {
    const placements = [
      { key: 'waist', label: '허리' },
      { key: 'shoulder', label: '어깨' },
      { key: 'back', label: '등' },
      { key: 'hem', label: '밑단' },
    ] as const;
    return (
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-400">위치:</span>
          {placements.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              data-placement={key}
              onClick={() => onExtraChange({ ...extra, placement: key })}
              className={chip(extra.placement === key || (!extra.placement && key === 'waist'))}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-400">수량:</span>
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              data-ribbon-count={n}
              onClick={() => onExtraChange({ ...extra, count: n })}
              className={chip((extra.count ?? 1) === n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (emb.type === 'decorativeButtons') {
    return (
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-400">면:</span>
          {[{ key: 'front', label: '앞' }, { key: 'back', label: '뒤' }].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              data-side={key}
              onClick={() => onExtraChange({ ...extra, side: key })}
              className={chip(extra.side === key || (!extra.side && key === 'front'))}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-400">수량:</span>
          {[3, 5, 8, 10, 15, 20].map((n) => (
            <button
              key={n}
              type="button"
              data-button-count={n}
              onClick={() => onExtraChange({ ...extra, count: n })}
              className={chip((extra.count ?? 5) === n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function EmbellishmentsPanel({ value, onChange }: EmbellishmentsPanelProps) {
  const [adding, setAdding] = useState(false);
  const [addType, setAddType] = useState<EmbellishmentType | null>(null);

  function updateAt(idx: number, patch: Partial<Embellishment>) {
    const next = value.map((e, i) => (i === idx ? { ...e, ...patch } : e));
    onChange(next);
  }

  function deleteAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function confirmAdd(region: Region) {
    if (!addType) return;
    onChange([...value, { type: addType, region, intensity: 1 }]);
    setAdding(false);
    setAddType(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="label-caps">장식</p>
        {!adding && (
          <button
            type="button"
            data-action="add-embellishment"
            onClick={() => setAdding(true)}
            className="text-xs px-2 py-1 rounded-xl border border-rose-300 text-rose-500 hover:bg-rose-50"
          >
            + 장식 추가
          </button>
        )}
      </div>

      {/* Inline add picker */}
      {adding && (
        <div className="border border-ink-100/60 rounded-xl p-2 flex flex-col gap-2 bg-cream-50">
          <p className="label-caps">종류 선택</p>
          <div className="grid grid-cols-3 gap-2">
            {TYPE_ORDER.map((t) => (
              <PreviewChip
                key={t}
                selected={addType === t}
                onClick={() => setAddType(t)}
                label={EMBELLISHMENTS[t].label}
                description={EMBELLISHMENT_SHORT[t]}
                previewSrc={previewUrl('embellishment', t)}
                dataAttrs={{ 'data-add-type': t }}
              />
            ))}
          </div>
          {addType && (
            <>
              <p className="label-caps">부위 선택</p>
              <div className="flex flex-wrap gap-1">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    data-add-region={r}
                    onClick={() => confirmAdd(r)}
                    className={chip(false)}
                  >
                    {REGION_LABELS[r]}
                  </button>
                ))}
              </div>
            </>
          )}
          <button
            type="button"
            data-action="cancel-add"
            onClick={() => { setAdding(false); setAddType(null); }}
            className="text-xs text-ink-400 hover:text-ink-900 self-end"
          >
            취소
          </button>
        </div>
      )}

      {/* Embellishment cards */}
      {value.length === 0 && !adding && (
        <p className="text-xs text-ink-400">장식 없음. 위의 버튼으로 추가하세요.</p>
      )}
      {value.map((emb, idx) => (
        <div
          key={idx}
          data-embellishment-card={idx}
          className={[
            'border rounded-xl p-2 flex flex-col gap-1',
            emb.intensity === 0 ? 'opacity-50 border-ink-100/60' : 'border-ink-100/60',
          ].join(' ')}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type chip */}
            <span className="text-xs font-medium text-ink-900 bg-cream-100 rounded-lg px-1.5 py-0.5">
              {EMBELLISHMENTS[emb.type].label}
            </span>
            {/* Region chip */}
            <span className="text-xs text-ink-400 bg-cream-100 rounded-lg px-1.5 py-0.5">
              {REGION_LABELS[emb.region]}
            </span>
            {/* Spacer */}
            <div className="flex-1" />
            {/* Delete */}
            <button
              type="button"
              data-delete={idx}
              onClick={() => deleteAt(idx)}
              className="text-xs text-ink-400 hover:text-rose-500"
              aria-label="삭제"
            >
              ✕
            </button>
          </div>

          {/* Intensity buttons 0-5 */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-ink-400 mr-1">강도:</span>
            {INTENSITIES.map((n) => (
              <button
                key={n}
                type="button"
                data-intensity={n}
                onClick={() => updateAt(idx, { intensity: n })}
                className={chip(emb.intensity === n)}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Extra options */}
          <ExtraControls
            emb={emb}
            onExtraChange={(extra) => updateAt(idx, { extra })}
          />
        </div>
      ))}
    </div>
  );
}
