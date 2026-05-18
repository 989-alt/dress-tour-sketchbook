import type { VeilEdgeDef } from '../types';

export const cut: VeilEdgeDef = {
  type: 'cut',
  label: '컷',
  renderEdge() {
    return null;
  },
};
