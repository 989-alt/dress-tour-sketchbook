import type { FabricDef } from './types';

export const chunkyBeadingDef: FabricDef = {
  type: 'chunkyBeading',
  label: '굵은 비즈',
  renderDef({ idPrefix, color, colorHex }) {
    const id = `${idPrefix}fabric-chunkyBeading-${color}`;
    return (
      <pattern key={id} id={id} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill={colorHex} />
        {/* Large crystal / stone — center */}
        <circle cx="8" cy="8" r="3.5" fill="white" opacity={0.75} />
        <circle cx="8" cy="8" r="2" fill="white" opacity={0.55} />
        {/* Medium pearl — top-left */}
        <circle cx="2" cy="2" r="2.2" fill="white" opacity={0.65} />
        <circle cx="2" cy="2" r="1" fill="white" opacity={0.5} />
        {/* Medium pearl — bottom-right */}
        <circle cx="14" cy="14" r="2.2" fill="white" opacity={0.65} />
        <circle cx="14" cy="14" r="1" fill="white" opacity={0.5} />
        {/* Small accent crystals */}
        <circle cx="14" cy="2" r="1.5" fill="white" opacity={0.6} />
        <circle cx="2" cy="14" r="1.5" fill="white" opacity={0.6} />
      </pattern>
    );
  },
};
