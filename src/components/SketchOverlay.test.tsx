import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { SketchOverlay, type SketchOverlayHandle } from './SketchOverlay';

const BASE_PROPS = {
  photoWidth: 800,
  photoHeight: 1200,
  displayWidth: 400,
  displayHeight: 600,
};

describe('SketchOverlay — rendering', () => {
  it('renders a canvas element', () => {
    render(<SketchOverlay {...BASE_PROPS} />);
    const canvas = screen.getByLabelText('sketch-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe('CANVAS');
  });

  it('canvas has correct backing pixel dimensions', () => {
    render(<SketchOverlay {...BASE_PROPS} />);
    const canvas = screen.getByLabelText('sketch-canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(1200);
  });

  it('mounts without errors for all brush sizes', () => {
    for (const brushSize of ['thin', 'medium', 'thick'] as const) {
      expect(() =>
        render(<SketchOverlay {...BASE_PROPS} brushSize={brushSize} />),
      ).not.toThrow();
    }
  });

  it('mounts without errors for all colors', () => {
    for (const color of ['black', 'navy', 'red'] as const) {
      expect(() =>
        render(<SketchOverlay {...BASE_PROPS} color={color} />),
      ).not.toThrow();
    }
  });

  it('mounts in eraser mode without errors', () => {
    expect(() =>
      render(<SketchOverlay {...BASE_PROPS} eraser />),
    ).not.toThrow();
  });
});

describe('SketchOverlay — imperative ref', () => {
  it('exposes undo and clear methods via ref', () => {
    const ref = createRef<SketchOverlayHandle>();
    render(<SketchOverlay ref={ref} {...BASE_PROPS} />);
    expect(typeof ref.current?.undo).toBe('function');
    expect(typeof ref.current?.clear).toBe('function');
  });

  it('calling undo() does not throw in jsdom', () => {
    const ref = createRef<SketchOverlayHandle>();
    render(<SketchOverlay ref={ref} {...BASE_PROPS} />);
    expect(() => ref.current?.undo()).not.toThrow();
  });

  it('calling clear() does not throw in jsdom', () => {
    const ref = createRef<SketchOverlayHandle>();
    render(<SketchOverlay ref={ref} {...BASE_PROPS} />);
    expect(() => ref.current?.clear()).not.toThrow();
  });
});
