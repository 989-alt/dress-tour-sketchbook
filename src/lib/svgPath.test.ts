import { describe, it, expect } from 'vitest';
import { mirrorPath } from './svgPath';

describe('mirrorPath', () => {
  it('mirrors a simple M L Z path', () => {
    expect(mirrorPath('M 100 120 L 130 120 Z')).toBe('M 300 120 L 270 120 Z');
  });

  it('mirrors M and multiple L commands', () => {
    const input  = 'M 130 120 L 100 130 L 95 200 L 145 210 L 145 120 Z';
    const result = mirrorPath(input);
    expect(result).toBe('M 270 120 L 300 130 L 305 200 L 255 210 L 255 120 Z');
  });

  it('mirrors a C (cubic bezier) command with 3 pairs', () => {
    const input  = 'M 130 120 C 110 130 105 150 115 170 L 145 170 L 145 120 Z';
    const result = mirrorPath(input);
    expect(result).toBe('M 270 120 C 290 130 295 150 285 170 L 255 170 L 255 120 Z');
  });

  it('x=200 (center) stays at 200', () => {
    expect(mirrorPath('M 200 100 Z')).toBe('M 200 100 Z');
  });

  it('x=0 maps to 400', () => {
    expect(mirrorPath('M 0 50 Z')).toBe('M 400 50 Z');
  });

  it('x=400 maps to 0', () => {
    expect(mirrorPath('M 400 50 Z')).toBe('M 0 50 Z');
  });

  it('y-coordinates are unchanged', () => {
    const result = mirrorPath('M 100 999 L 50 888 Z');
    expect(result).toContain('999');
    expect(result).toContain('888');
  });

  it('mirrors puff left path to expected right path', () => {
    const left  = 'M 125 120 C 90 130 75 180 105 200 L 145 200 L 145 120 Z';
    const right = mirrorPath(left);
    expect(right).toBe('M 275 120 C 310 130 325 180 295 200 L 255 200 L 255 120 Z');
  });

  it('mirrors long left path to expected right path', () => {
    const left  = 'M 130 120 L 100 140 L 80 460 L 130 470 L 145 120 Z';
    const right = mirrorPath(left);
    expect(right).toBe('M 270 120 L 300 140 L 320 460 L 270 470 L 255 120 Z');
  });

  it('Z token is preserved as-is', () => {
    expect(mirrorPath('M 50 50 Z')).toContain('Z');
  });
});
