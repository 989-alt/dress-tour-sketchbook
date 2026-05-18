import type { AccessoryType } from '../../types';
import { ACCESSORIES, ACCESSORY_ORDER } from '../../parts/accessories';
import { ACCESSORY_GLOSSARY } from '../../lib/glossary';

interface AccessoryPanelProps {
  value: AccessoryType;
  onChange: (next: AccessoryType) => void;
}

function chip(active: boolean) {
  return [
    'px-2 py-1 rounded border text-xs transition-colors',
    active
      ? 'border-blue-500 bg-blue-50 text-blue-700'
      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  ].join(' ');
}

/** Small SVG preview rendered inline using the accessory's render fn. */
function AccessoryPreview({ type }: { type: AccessoryType }) {
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
      <p className="text-xs font-semibold text-gray-600">헤어 액세서리</p>
      <div className="flex flex-wrap gap-2">
        {ACCESSORY_ORDER.map((type) => (
          <button
            key={type}
            data-accessory-type={type}
            onClick={() => onChange(type)}
            title={ACCESSORY_GLOSSARY[type]}
            className={chip(value === type)}
          >
            <AccessoryPreview type={type} />
            {ACCESSORIES[type].label}
          </button>
        ))}
      </div>
    </div>
  );
}
