import type { FabricDef } from './types';
import { adjustLightness } from '../../lib/colorPalette';

export const chiffonDef: FabricDef = {
  type: 'chiffon',
  label: '시폰',
  renderDef({ idPrefix, color, colorHex }) {
    // Flat lighter color with a gentle diagonal gradient
    const light = adjustLightness(colorHex, 0.06);
    const id = `${idPrefix}fabric-chiffon-${color}`;
    return (
      <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={light} />
        <stop offset="1" stopColor={colorHex} />
      </linearGradient>
    );
  },
};
