import type { VeilLengthDef } from '../types';

export const none: VeilLengthDef = {
  type: 'none',
  label: '없음',
  render() {
    return { back: null, front: null };
  },
};
