import { useState } from 'react';
import type { Embellishment, EmbellishmentType, Region, ColorEnum } from '../../types';
import { EMBELLISHMENTS } from '../../parts/embellishments';

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
    'px-2 py-1 rounded border text-xs transition-colors',
    active
      ? 'border-blue-500 bg-blue-50 text-blue-700'
      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
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
        <span className="text-xs text-gray-500">크기:</span>
        {sizes.map((s) => (
          <button
            key={s}
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
        <span className="text-xs text-gray-500">스타일:</span>
        {styles.map(({ key, label }) => (
          <button
            key={key}
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
          <span className="text-xs text-gray-500">위치:</span>
          {placements.map(({ key, label }) => (
            <button
              key={key}
              data-placement={key}
              onClick={() => onExtraChange({ ...extra, placement: key })}
              className={chip(extra.placement === key || (!extra.placement && key === 'waist'))}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">수량:</span>
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
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
          <span className="text-xs text-gray-500">면:</span>
          {[{ key: 'front', label: '앞' }, { key: 'back', label: '뒤' }].map(({ key, label }) => (
            <button
              key={key}
              data-side={key}
              onClick={() => onExtraChange({ ...extra, side: key })}
              className={chip(extra.side === key || (!extra.side && key === 'front'))}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">수량:</span>
          {[3, 5, 8, 10, 15, 20].map((n) => (
            <button
              key={n}
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
        <p className="text-xs font-semibold text-gray-700">장식</p>
        {!adding && (
          <button
            data-action="add-embellishment"
            onClick={() => setAdding(true)}
            className="text-xs px-2 py-1 rounded border border-blue-400 text-blue-600 hover:bg-blue-50"
          >
            + 장식 추가
          </button>
        )}
      </div>

      {/* Inline add picker */}
      {adding && (
        <div className="border border-gray-200 rounded p-2 flex flex-col gap-2 bg-gray-50">
          <p className="text-xs font-semibold text-gray-600">종류 선택</p>
          <div className="flex flex-wrap gap-1">
            {TYPE_ORDER.map((t) => (
              <button
                key={t}
                data-add-type={t}
                onClick={() => setAddType(t)}
                className={chip(addType === t)}
              >
                {EMBELLISHMENTS[t].label}
              </button>
            ))}
          </div>
          {addType && (
            <>
              <p className="text-xs font-semibold text-gray-600">부위 선택</p>
              <div className="flex flex-wrap gap-1">
                {REGIONS.map((r) => (
                  <button
                    key={r}
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
            data-action="cancel-add"
            onClick={() => { setAdding(false); setAddType(null); }}
            className="text-xs text-gray-400 hover:text-gray-600 self-end"
          >
            취소
          </button>
        </div>
      )}

      {/* Embellishment cards */}
      {value.length === 0 && !adding && (
        <p className="text-xs text-gray-400">장식 없음. 위의 버튼으로 추가하세요.</p>
      )}
      {value.map((emb, idx) => (
        <div
          key={idx}
          data-embellishment-card={idx}
          className={[
            'border rounded p-2 flex flex-col gap-1',
            emb.intensity === 0 ? 'opacity-50 border-gray-200' : 'border-gray-300',
          ].join(' ')}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type chip */}
            <span className="text-xs font-medium text-gray-700 bg-gray-100 rounded px-1.5 py-0.5">
              {EMBELLISHMENTS[emb.type].label}
            </span>
            {/* Region chip */}
            <span className="text-xs text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
              {REGION_LABELS[emb.region]}
            </span>
            {/* Spacer */}
            <div className="flex-1" />
            {/* Delete */}
            <button
              data-delete={idx}
              onClick={() => deleteAt(idx)}
              className="text-xs text-red-400 hover:text-red-600"
              aria-label="삭제"
            >
              ✕
            </button>
          </div>

          {/* Intensity buttons 0-5 */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-1">강도:</span>
            {INTENSITIES.map((n) => (
              <button
                key={n}
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
