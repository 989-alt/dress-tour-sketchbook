import type { NecklineDef } from './types';

// Boat neck (bateau): wide shallow horizontal cut across the collarbone
export const boat: NecklineDef = {
  type: 'boat',
  label: '보트',
  topY: 120,
  cutoutPath:
    'M 130,120 L 130,145 C 165,160 235,160 270,145 L 270,120 Z',
};
