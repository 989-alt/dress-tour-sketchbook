import type { BackDef } from './types';

export const illusionBack: BackDef = {
  type: 'illusionBack',
  label: '일루전 백',
  render({ topY, waistY }) {
    const h = waistY - topY;
    return (
      <g data-back="illusionBack">
        {/* thin dashed line at each shoulder edge suggesting sheer fabric */}
        <line x1={140} y1={topY} x2={140} y2={topY + h * 0.5} stroke="#bbb" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <line x1={260} y1={topY} x2={260} y2={topY + h * 0.5} stroke="#bbb" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      </g>
    );
  },
};
