import type { FabricDef } from './types';
import { adjustLightness } from '../../lib/colorPalette';

export const organzaDef: FabricDef = {
  type: 'organza',
  label: '오간자',
  renderDef({ idPrefix, color, colorHex }) {
    // Translucent feel: subtle gradient, lighter in centre
    const lighter = adjustLightness(colorHex, 0.12);
    const id = `${idPrefix}fabric-organza-${color}`;
    return (
      <linearGradient key={id} id={id} x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0" stopColor={colorHex} stopOpacity={0.85} />
        <stop offset="0.4" stopColor={lighter} stopOpacity={0.7} />
        <stop offset="1" stopColor={colorHex} stopOpacity={0.8} />
      </linearGradient>
    );
  },
};
