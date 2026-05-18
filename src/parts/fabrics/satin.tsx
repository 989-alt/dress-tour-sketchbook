import type { FabricDef } from './types';
import { adjustLightness } from '../../lib/colorPalette';

export const satinDef: FabricDef = {
  type: 'satin',
  label: '새틴',
  renderDef({ idPrefix, color, colorHex }) {
    const lighter = adjustLightness(colorHex, 0.08);
    const darker = adjustLightness(colorHex, -0.05);
    const id = `${idPrefix}fabric-satin-${color}`;
    return (
      <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={lighter} />
        <stop offset="0.5" stopColor={colorHex} />
        <stop offset="1" stopColor={darker} />
      </linearGradient>
    );
  },
};
