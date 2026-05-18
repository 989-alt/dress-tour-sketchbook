import type { FabricDef } from './types';

export const delicateBeadingDef: FabricDef = {
  type: 'delicateBeading',
  label: '맑은 비즈',
  renderDef({ idPrefix, color, colorHex }) {
    const id = `${idPrefix}fabric-delicateBeading-${color}`;
    return (
      <pattern key={id} id={id} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill={colorHex} />
        {/* Seed bead — primary position */}
        <circle cx="2" cy="2" r="0.9" fill="white" opacity={0.55} />
        {/* Micro pearl — offset */}
        <circle cx="6" cy="3" r="1.1" fill="white" opacity={0.45} />
        {/* Tiny crystal — lower area */}
        <circle cx="3" cy="6.5" r="0.8" fill="white" opacity={0.5} />
        {/* Very subtle fill dot */}
        <circle cx="7" cy="7" r="0.7" fill="white" opacity={0.35} />
      </pattern>
    );
  },
};
