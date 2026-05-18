import type { NecklineType } from '../../types';
import { NECKLINES } from '../../parts/necklines';

const NECKLINE_ORDER: NecklineType[] = [
  'sweetheart', 'vRegular', 'vDeep', 'vPlunging', 'halter',
  'offShoulder', 'oneShoulder', 'strapless', 'boat', 'illusionCrew',
  'square', 'scoop', 'portrait', 'highNeck', 'keyhole',
];

interface NecklinePanelProps {
  value: NecklineType;
  onChange: (next: NecklineType) => void;
}

export function NecklinePanel({ value, onChange }: NecklinePanelProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {NECKLINE_ORDER.map((type) => {
        const def = NECKLINES[type];
        const selected = type === value;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            data-neckline={type}
            className={[
              'flex flex-col items-center gap-1 p-2 rounded border transition-colors',
              selected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50',
            ].join(' ')}
          >
            <svg viewBox="100 100 200 120" width={60} height={36} aria-hidden>
              {/* Bodice top bounding box */}
              <rect x="140" y="120" width="120" height="80" fill="#e5e7eb" />
              {/* Neckline cutout */}
              <path d={def.cutoutPath} fill={selected ? '#93c5fd' : '#9ca3af'} />
            </svg>
            <span className="text-xs text-gray-700 leading-tight text-center">{def.label}</span>
          </button>
        );
      })}
    </div>
  );
}
