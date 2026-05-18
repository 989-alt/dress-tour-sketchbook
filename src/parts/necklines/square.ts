import type { NecklineDef } from './types';

// Square neck: rectangular cutout with straight edges
export const square: NecklineDef = {
  type: 'square',
  label: '사각형',
  topY: 120,
  cutoutPath:
    'M 150,120 L 150,180 L 250,180 L 250,120 Z',
};
