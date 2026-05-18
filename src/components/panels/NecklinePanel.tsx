import type { NecklineType } from '../../types';
import { NECKLINES } from '../../parts/necklines';
import { NECKLINE_SHORT } from '../../lib/glossary';
import { PreviewChip } from '../PreviewChip';
import { previewUrl } from '../../lib/previewImages';

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
          <PreviewChip
            key={type}
            selected={selected}
            onClick={() => onChange(type)}
            label={def.label}
            description={NECKLINE_SHORT[type]}
            previewSrc={previewUrl('neckline', type)}
            svgFallback={
              <svg viewBox="100 100 200 120" width={60} height={36} aria-hidden>
                <rect x="140" y="120" width="120" height="80" fill="#e5e7eb" />
                <path d={def.cutoutPath} fill={selected ? '#93c5fd' : '#9ca3af'} />
              </svg>
            }
            dataAttrs={{ 'data-neckline': type }}
          />
        );
      })}
    </div>
  );
}
