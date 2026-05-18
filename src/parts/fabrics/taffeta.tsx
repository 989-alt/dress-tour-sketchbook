import type { FabricDef } from './types';
import { adjustLightness } from '../../lib/colorPalette';

export const taffetaDef: FabricDef = {
  type: 'taffeta',
  label: '태피터',
  renderDef({ idPrefix, color, colorHex }) {
    // Strong shimmery contrast
    const bright = adjustLightness(colorHex, 0.15);
    const dark = adjustLightness(colorHex, -0.1);
    const id = `${idPrefix}fabric-taffeta-${color}`;
    return (
      <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={bright} />
        <stop offset="0.35" stopColor={colorHex} />
        <stop offset="0.65" stopColor={colorHex} />
        <stop offset="1" stopColor={dark} />
      </linearGradient>
    );
  },
};
