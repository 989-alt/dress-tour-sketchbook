import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { SketchOverlay, type SketchOverlayHandle } from './SketchOverlay';
import type { RegionPrompt } from '../types';

const BASE_PROPS = {
  photoWidth: 800,
  photoHeight: 1200,
  displayWidth: 400,
  displayHeight: 600,
  savedRegions: [] as RegionPrompt[],
};

const SAMPLE_REGION: RegionPrompt = {
  id: 'r1',
  pathData: 'M 10.0 20.0 L 30.0 40.0',
  prompt: '레이스 추가',
  hue: 0,
  createdAt: 1000,
};

describe('SketchOverlay — rendering', () => {
  it('renders an SVG element with aria-label sketch-canvas', () => {
    render(<SketchOverlay {...BASE_PROPS} />);
    const svg = screen.getByLabelText('sketch-canvas');
    expect(svg).toBeInTheDocument();
    expect(svg.tagName).toBe('svg');
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

  it('renders saved regions as SVG paths', () => {
    const { container } = render(
      <SketchOverlay {...BASE_PROPS} savedRegions={[SAMPLE_REGION]} />,
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(1);
    const savedPath = Array.from(paths).find((p) => p.getAttribute('d') === SAMPLE_REGION.pathData);
    expect(savedPath).toBeTruthy();
  });

  it('renders two saved regions as two paths', () => {
    const regions: RegionPrompt[] = [
      SAMPLE_REGION,
      { id: 'r2', pathData: 'M 5.0 5.0 L 50.0 50.0', prompt: '다른 영역', hue: 60, createdAt: 2000 },
    ];
    const { container } = render(<SketchOverlay {...BASE_PROPS} savedRegions={regions} />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(2);
  });
});

describe('SketchOverlay — imperative ref', () => {
  it('exposes undoStroke, finishRegion, clearInProgress via ref', () => {
    const ref = createRef<SketchOverlayHandle>();
    render(<SketchOverlay ref={ref} {...BASE_PROPS} />);
    expect(typeof ref.current?.undoStroke).toBe('function');
    expect(typeof ref.current?.finishRegion).toBe('function');
    expect(typeof ref.current?.clearInProgress).toBe('function');
  });

  it('finishRegion returns null when no strokes drawn', () => {
    const ref = createRef<SketchOverlayHandle>();
    render(<SketchOverlay ref={ref} {...BASE_PROPS} />);
    expect(ref.current?.finishRegion()).toBeNull();
  });

  it('clearInProgress does not throw', () => {
    const ref = createRef<SketchOverlayHandle>();
    render(<SketchOverlay ref={ref} {...BASE_PROPS} />);
    expect(() => ref.current?.clearInProgress()).not.toThrow();
  });

  it('undoStroke does not throw when no strokes', () => {
    const ref = createRef<SketchOverlayHandle>();
    render(<SketchOverlay ref={ref} {...BASE_PROPS} />);
    expect(() => ref.current?.undoStroke()).not.toThrow();
  });
});
