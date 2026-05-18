import type { BackDef } from './types';

export const openBack: BackDef = {
  type: 'openBack',
  label: '오픈백',
  render({ topY, waistY, openDepth }) {
    // Curved notch on each shoulder edge; deeper with openDepth (0–5)
    const depth = openDepth * 6; // 0–30px
    const h = Math.min((waistY - topY) * 0.4, 60);
    const ly = topY + 15;
    return (
      <g data-back="openBack">
        {/* left notch: curve cutting inward */}
        <path
          d={`M 140,${ly} Q ${140 - depth},${ly + h / 2} 140,${ly + h}`}
          fill="none" stroke="#aaa" strokeWidth="1.2" opacity="0.7"
        />
        {/* right notch */}
        <path
          d={`M 260,${ly} Q ${260 + depth},${ly + h / 2} 260,${ly + h}`}
          fill="none" stroke="#aaa" strokeWidth="1.2" opacity="0.7"
        />
      </g>
    );
  },
};
