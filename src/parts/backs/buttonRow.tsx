import type { BackDef } from './types';

export const buttonRow: BackDef = {
  type: 'buttonRow',
  label: '단추 줄',
  render({ topY }) {
    const startY = topY + 10;
    const gap = 10;
    const dots = [0, 1, 2, 3, 4];
    return (
      <g data-back="buttonRow">
        {dots.map((i) => (
          <circle key={`l${i}`} cx={140} cy={startY + i * gap} r={2} fill="none" stroke="#aaa" strokeWidth="1" opacity="0.7" />
        ))}
        {dots.map((i) => (
          <circle key={`r${i}`} cx={260} cy={startY + i * gap} r={2} fill="none" stroke="#aaa" strokeWidth="1" opacity="0.7" />
        ))}
      </g>
    );
  },
};
