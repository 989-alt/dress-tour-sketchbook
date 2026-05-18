import type { BackType } from '../../types';
import { BACKS } from '../../parts/backs';
import { BACK_SHORT } from '../../lib/glossary';
import { PreviewChip } from '../PreviewChip';
import { previewUrl } from '../../lib/previewImages';

const BACK_ORDER: BackType[] = [
  'closed', 'vBack', 'illusionBack', 'openBack',
  'keyhole', 'buttonRow', 'laceUpCorset', 'drape',
];

const DEPTH_VALUES = [0, 1, 2, 3, 4, 5] as const;

interface BackPanelProps {
  value: { type: BackType; openDepth: 0 | 1 | 2 | 3 | 4 | 5 };
  onChange: (next: { type: BackType; openDepth: 0 | 1 | 2 | 3 | 4 | 5 }) => void;
}

export function BackPanel({ value, onChange }: BackPanelProps) {
  function setType(type: BackType) {
    onChange({ ...value, type });
  }

  function setDepth(openDepth: 0 | 1 | 2 | 3 | 4 | 5) {
    onChange({ ...value, openDepth });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="label-caps mb-1">등판 스타일</p>
        <div className="grid grid-cols-3 gap-2">
          {BACK_ORDER.map((bt) => (
            <PreviewChip
              key={bt}
              selected={bt === value.type}
              onClick={() => setType(bt)}
              label={BACKS[bt].label}
              description={BACK_SHORT[bt]}
              previewSrc={previewUrl('back', bt)}
              dataAttrs={{ 'data-back-type': bt }}
            />
          ))}
        </div>
      </div>

      {value.type === 'openBack' && (
        <div>
          <p className="label-caps mb-1">개방 깊이</p>
          <div className="flex gap-2">
            {DEPTH_VALUES.map((d) => (
              <button
                key={d}
                type="button"
                data-open-depth={d}
                onClick={() => setDepth(d)}
                className={[
                  'w-8 h-8 rounded-xl border text-xs transition-colors',
                  d === value.openDepth
                    ? 'border-rose-400 bg-rose-50 text-rose-600'
                    : 'border-ink-100/60 bg-cream-50 text-ink-900 hover:bg-cream-100',
                ].join(' ')}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
