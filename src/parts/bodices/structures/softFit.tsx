import type { BodiceStructureDef } from '../types';

export const softFit: BodiceStructureDef = {
  type: 'softFit',
  label: '소프트핏',
  render() {
    // No visible overlay for soft fit — smooth unadorned bodice surface.
    return null;
  },
};
