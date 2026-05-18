import type { SleeveDef } from './types';

// Illusion sleeve: same silhouette as long, intended to be rendered sheer
export const illusion: SleeveDef = {
  type: 'illusion',
  label: '일루전',
  renders: true,
  paths: {
    left:  'M 130 120 L 100 140 L 80 460 L 130 470 L 145 120 Z',
    right: 'M 270 120 L 300 140 L 320 460 L 270 470 L 255 120 Z',
  },
};
