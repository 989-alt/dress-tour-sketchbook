import type { SilhouetteType } from '../../types';
import { SILHOUETTES } from '../../parts/silhouettes';

const SILHOUETTE_LABELS: Record<SilhouetteType, string> = {
  aline: 'A-라인',
  mermaid: '머메이드',
  trumpet: '트럼펫',
  princess: '프린세스',
  sheath: '시스',
  empire: '엠파이어',
  fitFlare: '핏앤플레어',
  tealength: '티렝스',
  mini: '미니',
};

const SILHOUETTE_ORDER: SilhouetteType[] = [
  'aline', 'mermaid', 'trumpet', 'princess', 'sheath', 'empire', 'fitFlare', 'tealength', 'mini',
];

interface SilhouettePanelProps {
  value: SilhouetteType;
  onChange: (next: SilhouetteType) => void;
}

export function SilhouettePanel({ value, onChange }: SilhouettePanelProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {SILHOUETTE_ORDER.map((type) => {
        const def = SILHOUETTES[type];
        const selected = type === value;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            data-silhouette={type}
            className={[
              'flex flex-col items-center gap-1 p-2 rounded border transition-colors',
              selected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50',
            ].join(' ')}
          >
            <svg
              viewBox="0 0 400 800"
              width={36}
              height={72}
              aria-hidden
            >
              <path d={def.bodyPath} fill={selected ? '#93c5fd' : '#d1d5db'} />
            </svg>
            <span className="text-xs text-gray-700">{SILHOUETTE_LABELS[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
