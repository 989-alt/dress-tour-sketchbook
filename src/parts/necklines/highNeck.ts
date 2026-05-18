import type { NecklineDef } from './types';

// High neck / mock-neck: collar extends upward above the bodice line toward the throat
export const highNeck: NecklineDef = {
  type: 'highNeck',
  label: '하이넥',
  topY: 70,
  cutoutPath:
    'M 175,120 L 175,80 C 175,70 225,70 225,80 L 225,120 Z',
};
