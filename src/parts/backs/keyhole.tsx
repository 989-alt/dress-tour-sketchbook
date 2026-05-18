import type { BackDef } from './types';

export const keyhole: BackDef = {
  type: 'keyhole',
  label: '키홀',
  render({ topY }) {
    const cy = topY + 8;
    return (
      <g data-back="keyhole">
        {/* small oval above each shoulder */}
        <ellipse cx={140} cy={cy} rx={4} ry={6} fill="none" stroke="#aaa" strokeWidth="1" opacity="0.7" />
        <ellipse cx={260} cy={cy} rx={4} ry={6} fill="none" stroke="#aaa" strokeWidth="1" opacity="0.7" />
      </g>
    );
  },
};
