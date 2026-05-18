import type { SleeveDef } from './types';

export const cap: SleeveDef = {
  type: 'cap',
  label: '캡',
  renders: true,
  paths: {
    left:  'M 130 120 C 110 130 105 150 115 170 L 145 170 L 145 120 Z',
    right: 'M 270 120 C 290 130 295 150 285 170 L 255 170 L 255 120 Z',
  },
};
