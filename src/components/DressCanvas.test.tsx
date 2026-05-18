import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DressCanvas } from './DressCanvas';
import { createDefaultEntry } from '../types';
import type { AnchorSet } from '../types';
import { SILHOUETTES } from '../parts/silhouettes';

// jsdom does not implement URL.createObjectURL or ResizeObserver
beforeAll(() => {
  if (!globalThis.URL.createObjectURL) {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:fake-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  }
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

function makeAnchors(): AnchorSet {
  return { ...SILHOUETTES['aline'].referencePose.anchors } as AnchorSet;
}

const PHOTO = new Blob(['fake-image-data'], { type: 'image/png' });

const BASE_PROPS = {
  photo: PHOTO,
  photoWidth: 800,
  photoHeight: 1200,
};

describe('DressCanvas — basic rendering', () => {
  it('renders without throwing given a synthetic photo Blob', () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('dc-1', anchors);
    expect(() =>
      render(
        <DressCanvas
          {...BASE_PROPS}
          entry={entry}
          anchors={anchors}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 12 clipPath elements from composeDress', () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('dc-2', anchors);
    const { container } = render(
      <DressCanvas
        {...BASE_PROPS}
        entry={entry}
        anchors={anchors}
      />,
    );
    const clipPaths = container.querySelectorAll('clipPath');
    expect(clipPaths).toHaveLength(12);
  });

  it('renders an img element for the photo', () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('dc-3', anchors);
    render(
      <DressCanvas
        {...BASE_PROPS}
        entry={entry}
        anchors={anchors}
      />,
    );
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.src).toContain('blob:fake-url');
  });
});

describe('DressCanvas — showAnchors', () => {
  it('does not render AnchorOverlay when showAnchors is false', () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('dc-4', anchors);
    render(
      <DressCanvas
        {...BASE_PROPS}
        entry={entry}
        anchors={anchors}
        showAnchors={false}
      />,
    );
    expect(screen.queryByLabelText('anchor-overlay')).toBeNull();
  });

  it('renders AnchorOverlay when showAnchors is true', () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('dc-5', anchors);
    render(
      <DressCanvas
        {...BASE_PROPS}
        entry={entry}
        anchors={anchors}
        showAnchors
      />,
    );
    expect(screen.getByLabelText('anchor-overlay')).toBeInTheDocument();
  });
});

describe('DressCanvas — showSketch', () => {
  it('does not render SketchOverlay when showSketch is false', () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('dc-6', anchors);
    render(
      <DressCanvas
        {...BASE_PROPS}
        entry={entry}
        anchors={anchors}
        showSketch={false}
      />,
    );
    expect(screen.queryByLabelText('sketch-canvas')).toBeNull();
  });

  it('renders SketchOverlay when showSketch is true', () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('dc-7', anchors);
    render(
      <DressCanvas
        {...BASE_PROPS}
        entry={entry}
        anchors={anchors}
        showSketch
      />,
    );
    expect(screen.getByLabelText('sketch-canvas')).toBeInTheDocument();
  });

  it('renders both overlays when showAnchors and showSketch are true', () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('dc-8', anchors);
    render(
      <DressCanvas
        {...BASE_PROPS}
        entry={entry}
        anchors={anchors}
        showAnchors
        showSketch
      />,
    );
    expect(screen.getByLabelText('anchor-overlay')).toBeInTheDocument();
    expect(screen.getByLabelText('sketch-canvas')).toBeInTheDocument();
  });
});
