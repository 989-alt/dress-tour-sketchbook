import type { FabricDef } from './types';

export const tulleDef: FabricDef = {
  type: 'tulle',
  label: '튤',
  renderDef({ idPrefix, color, colorHex }) {
    const id = `${idPrefix}fabric-tulle-${color}`;
    return (
      <pattern key={id} id={id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill={colorHex} />
        <circle cx="5" cy="5" r="1.2" fill="white" opacity={0.35} />
        <circle cx="15" cy="5" r="1.2" fill="white" opacity={0.35} />
        <circle cx="5" cy="15" r="1.2" fill="white" opacity={0.35} />
        <circle cx="15" cy="15" r="1.2" fill="white" opacity={0.35} />
        <circle cx="10" cy="10" r="1.2" fill="white" opacity={0.2} />
      </pattern>
    );
  },
};
