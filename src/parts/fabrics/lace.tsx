import type { FabricDef } from './types';

export const laceDef: FabricDef = {
  type: 'lace',
  label: '레이스',
  renderDef({ idPrefix, color, colorHex }) {
    const id = `${idPrefix}fabric-lace-${color}`;
    return (
      <pattern key={id} id={id} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill={colorHex} />
        {/* Flower grid: center petal ring + inner dot */}
        <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="0.6" opacity={0.5} />
        <circle cx="12" cy="12" r="1.8" fill="white" opacity={0.45} />
        {/* Corner accent dots */}
        <circle cx="0" cy="0" r="1.2" fill="white" opacity={0.3} />
        <circle cx="24" cy="0" r="1.2" fill="white" opacity={0.3} />
        <circle cx="0" cy="24" r="1.2" fill="white" opacity={0.3} />
        <circle cx="24" cy="24" r="1.2" fill="white" opacity={0.3} />
      </pattern>
    );
  },
};
