import type { SleeveDef } from './types';

export const bell: SleeveDef = {
  type: 'bell',
  label: '벨',
  renders: true,
  paths: {
    left:  'M 130 120 L 100 130 L 60 460 L 135 480 L 145 120 Z',
    right: 'M 270 120 L 300 130 L 340 460 L 265 480 L 255 120 Z',
  },
};
