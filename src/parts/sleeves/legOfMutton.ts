import type { SleeveDef } from './types';

export const legOfMutton: SleeveDef = {
  type: 'legOfMutton',
  label: '양다리',
  renders: true,
  paths: {
    left:  'M 130 120 C 80 130 70 220 110 240 L 95 460 L 130 470 L 140 240 L 145 220 L 145 120 Z',
    right: 'M 270 120 C 320 130 330 220 290 240 L 305 460 L 270 470 L 260 240 L 255 220 L 255 120 Z',
  },
};
