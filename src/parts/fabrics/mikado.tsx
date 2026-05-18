import type { FabricDef } from './types';
import { adjustLightness } from '../../lib/colorPalette';

export const mikadoDef: FabricDef = {
  type: 'mikado',
  label: '미카도',
  renderDef({ idPrefix, color, colorHex }) {
    // Matte look: very subtle gradient, slightly cooler (lower lightness)
    const matte = adjustLightness(colorHex, -0.02);
    const id = `${idPrefix}fabric-mikado-${color}`;
    return (
      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={colorHex} />
        <stop offset="1" stopColor={matte} />
      </linearGradient>
    );
  },
};
