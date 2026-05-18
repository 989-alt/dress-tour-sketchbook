import type { AccessoryType } from '../../types';
import { ACCESSORIES, ACCESSORY_ORDER } from '../../parts/accessories';
import { ACCESSORY_SHORT } from '../../lib/glossary';
import { PreviewChip } from '../PreviewChip';
import { previewUrl } from '../../lib/previewImages';

interface AccessoryPanelProps {
  value: AccessoryType;
  onChange: (next: AccessoryType) => void;
}

function AccessorySvgFallback({ type }: { type: AccessoryType }) {
  if (type === 'none') return null;
  const def = ACCESSORIES[type];
  const el = def.render({ headTopX: 16, headTopY: 6, color: '#888', idPrefix: `prev-${type}-` });
  if (!el) return null;
  return (
    <svg width={32} height={28} viewBox="0 0 32 28" aria-hidden>
      {el}
    </svg>
  );
}

export function AccessoryPanel({ value, onChange }: AccessoryPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="label-caps">헤어 액세서리</p>
      <div className="grid grid-cols-3 gap-2">
        {ACCESSORY_ORDER.map((type) => (
          <PreviewChip
            key={type}
            selected={value === type}
            onClick={() => onChange(type)}
            label={ACCESSORIES[type].label}
            description={ACCESSORY_SHORT[type]}
            previewSrc={previewUrl('accessory', type)}
            svgFallback={<AccessorySvgFallback type={type} />}
            dataAttrs={{ 'data-accessory-type': type }}
          />
        ))}
      </div>
    </div>
  );
}
