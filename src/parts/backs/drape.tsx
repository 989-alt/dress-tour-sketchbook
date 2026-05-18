import type { BackDef } from './types';

export const drape: BackDef = {
  type: 'drape',
  label: '드레이프',
  render({ topY }) {
    const y = topY + 10;
    return (
      <g data-back="drape">
        {/* flowing curve hanging from each shoulder */}
        <path d={`M 138,${y} Q 130,${y + 18} 140,${y + 28}`} fill="none" stroke="#bbb" strokeWidth="1.2" opacity="0.7" />
        <path d={`M 262,${y} Q 270,${y + 18} 260,${y + 28}`} fill="none" stroke="#bbb" strokeWidth="1.2" opacity="0.7" />
      </g>
    );
  },
};
