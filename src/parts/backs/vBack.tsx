import type { BackDef } from './types';

export const vBack: BackDef = {
  type: 'vBack',
  label: 'V 백',
  render({ topY }) {
    // Small V hint at each shoulder edge
    const ly = topY + 10;
    return (
      <g data-back="vBack">
        {/* left shoulder V */}
        <path d={`M 138,${ly} L 143,${ly + 14} L 148,${ly}`} fill="none" stroke="#aaa" strokeWidth="1.2" opacity="0.7" />
        {/* right shoulder V */}
        <path d={`M 252,${ly} L 257,${ly + 14} L 262,${ly}`} fill="none" stroke="#aaa" strokeWidth="1.2" opacity="0.7" />
      </g>
    );
  },
};
