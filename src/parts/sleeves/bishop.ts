import type { SleeveDef } from './types';

export const bishop: SleeveDef = {
  type: 'bishop',
  label: '비숍',
  renders: true,
  paths: {
    left:  'M 130 120 L 105 200 L 65 470 L 130 480 L 135 470 L 130 200 L 145 120 Z',
    right: 'M 270 120 L 295 200 L 335 470 L 270 480 L 265 470 L 270 200 L 255 120 Z',
  },
};
