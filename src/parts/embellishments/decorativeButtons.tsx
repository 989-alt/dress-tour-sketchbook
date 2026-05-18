import type { EmbellishmentDef } from './types';

export const decorativeButtons: EmbellishmentDef = {
  type: 'decorativeButtons',
  label: '단추',
  render({ intensity, color, extra, idPrefix }) {
    const count = typeof extra?.count === 'number' ? Math.min(extra.count, 20) : intensity * 3;
    // Vertical row along center-back (canonical: x=200, y from 130 to 390)
    const startY = 140;
    const endY = 380;
    const spacing = count > 1 ? (endY - startY) / (count - 1) : 0;
    const cx = 200;
    return (
      <g data-embellishment="decorativeButtons" data-intensity={intensity}>
        {Array.from({ length: count }, (_, i) => {
          const cy = count > 1 ? startY + i * spacing : (startY + endY) / 2;
          return (
            <g key={`${idPrefix}btn-${i}`}>
              <circle cx={cx} cy={cy} r={3.5} fill={color} opacity={0.85} />
              <circle cx={cx} cy={cy} r={1.5} fill="none" stroke="#ffffff" strokeWidth={0.6} opacity={0.5} />
            </g>
          );
        })}
      </g>
    );
  },
};
