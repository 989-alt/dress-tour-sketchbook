import type { BackDef } from './types';

export const laceUpCorset: BackDef = {
  type: 'laceUpCorset',
  label: '레이스업 코르셋',
  render({ topY }) {
    const y0 = topY + 8;
    const y1 = topY + 22;
    return (
      <g data-back="laceUpCorset">
        {/* cross-hatch lines on left shoulder edge */}
        <line x1={135} y1={y0} x2={145} y2={y1} stroke="#aaa" strokeWidth="1" opacity="0.7" />
        <line x1={145} y1={y0} x2={135} y2={y1} stroke="#aaa" strokeWidth="1" opacity="0.7" />
        {/* cross-hatch lines on right shoulder edge */}
        <line x1={255} y1={y0} x2={265} y2={y1} stroke="#aaa" strokeWidth="1" opacity="0.7" />
        <line x1={265} y1={y0} x2={255} y2={y1} stroke="#aaa" strokeWidth="1" opacity="0.7" />
      </g>
    );
  },
};
