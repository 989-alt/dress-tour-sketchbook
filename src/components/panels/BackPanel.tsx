import type { BackType } from '../../types';
import { BACKS } from '../../parts/backs';

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
        <p className="text-xs font-semibold text-gray-600 mb-1">등판 스타일</p>
        <div className="flex flex-wrap gap-2">
          {BACK_ORDER.map((bt) => (
            <button
              key={bt}
              data-back-type={bt}
              onClick={() => setType(bt)}
              className={[
                'px-2 py-1 rounded border text-xs transition-colors',
                bt === value.type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {BACKS[bt].label}
            </button>
          ))}
        </div>
      </div>

      {value.type === 'openBack' && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">개방 깊이</p>
          <div className="flex gap-2">
            {DEPTH_VALUES.map((d) => (
              <button
                key={d}
                data-open-depth={d}
                onClick={() => setDepth(d)}
                className={[
                  'w-8 h-8 rounded border text-xs transition-colors',
                  d === value.openDepth
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
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
