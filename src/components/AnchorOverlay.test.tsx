import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnchorOverlay } from './AnchorOverlay';
import { MESH_ANCHOR_ORDER } from '../lib/warp';
import type { AnchorSet } from '../types';

// jsdom does not implement pointer capture APIs
beforeAll(() => {
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
  }
});

function makeAnchors(): AnchorSet {
  return {
    headTop:    { x: 400, y:  50 },
    chin:       { x: 400, y: 140 },
    neckCenter: { x: 400, y: 165 },
    shoulderL:  { x: 300, y: 200 },
    shoulderR:  { x: 500, y: 200 },
    bust:       { x: 400, y: 300 },
    waist:      { x: 400, y: 450 },
    hipL:       { x: 320, y: 550 },
    hipR:       { x: 480, y: 550 },
    kneeL:      { x: 340, y: 750 },
    kneeR:      { x: 460, y: 750 },
    hemL:       { x: 320, y: 950 },
    hemR:       { x: 480, y: 950 },
    hemCenter:  { x: 400, y: 970 },
  };
}

const BASE_PROPS = {
  photoWidth: 800,
  photoHeight: 1200,
  displayWidth: 400,
  displayHeight: 600,
  onChange: vi.fn(),
};

describe('AnchorOverlay — auto mode (13 dots)', () => {
  it('renders 13 anchor dots (MESH_ANCHOR_ORDER) in auto mode', () => {
    render(<AnchorOverlay anchors={makeAnchors()} {...BASE_PROPS} />);
    const dots = screen.getAllByRole('button');
    expect(dots).toHaveLength(MESH_ANCHOR_ORDER.length);
    expect(dots).toHaveLength(13);
  });

  it('each dot has data-anchor matching a MESH_ANCHOR_ORDER key', () => {
    render(<AnchorOverlay anchors={makeAnchors()} {...BASE_PROPS} />);
    const dots = screen.getAllByRole('button');
    const keys = dots.map((d) => d.getAttribute('data-anchor'));
    for (const key of MESH_ANCHOR_ORDER) {
      expect(keys).toContain(key);
    }
  });
});

describe('AnchorOverlay — manual mode (5 dots)', () => {
  it('renders only 5 anchor dots in manual mode', () => {
    render(<AnchorOverlay anchors={makeAnchors()} {...BASE_PROPS} manualMode />);
    const dots = screen.getAllByRole('button');
    expect(dots).toHaveLength(5);
  });

  it('manual mode dots are shoulderL, shoulderR, waist, hemL, hemR', () => {
    render(<AnchorOverlay anchors={makeAnchors()} {...BASE_PROPS} manualMode />);
    const dots = screen.getAllByRole('button');
    const keys = new Set(dots.map((d) => d.getAttribute('data-anchor')));
    expect(keys).toEqual(new Set(['shoulderL', 'shoulderR', 'waist', 'hemL', 'hemR']));
  });
});

describe('AnchorOverlay — click does not crash', () => {
  it('clicking a dot fires no error', () => {
    const onChange = vi.fn();
    render(<AnchorOverlay anchors={makeAnchors()} {...BASE_PROPS} onChange={onChange} />);
    const dot = screen.getAllByRole('button')[0];
    expect(() => dot.click()).not.toThrow();
  });
});

describe('AnchorOverlay — drag interaction', () => {
  it('calls onChange with scaled photo coords after pointerdown + pointermove', () => {
    // photoWidth=400, photoHeight=800, displayWidth=200, displayHeight=400
    // scaleX = 200/400 = 0.5, scaleY = 400/800 = 0.5
    // shoulderL at photo (100, 200) → display (50, 100)
    const anchors: AnchorSet = { ...makeAnchors(), shoulderL: { x: 100, y: 200 } };
    const onChange = vi.fn();
    render(
      <AnchorOverlay
        anchors={anchors}
        photoWidth={400}
        photoHeight={800}
        displayWidth={200}
        displayHeight={400}
        onChange={onChange}
      />,
    );

    // getBoundingClientRect returns {left:0,top:0,...} in jsdom by default
    const dot = screen.getByLabelText('anchor-shoulderL');

    fireEvent.pointerDown(dot, { pointerId: 1, clientX: 50, clientY: 100 });
    // drag to display (100, 150) → photo coords Math.round(100/0.5)=200, Math.round(150/0.5)=300
    fireEvent.pointerMove(dot, { pointerId: 1, clientX: 100, clientY: 150, buttons: 1 });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ shoulderL: { x: 200, y: 300 } }),
    );
  });
});

describe('AnchorOverlay — confidence colors', () => {
  it('high confidence (>0.7) renders dark fill (#333)', () => {
    const confidence = { shoulderL: 0.9 };
    render(<AnchorOverlay anchors={makeAnchors()} {...BASE_PROPS} confidence={confidence} manualMode />);
    const dot = screen.getByLabelText('anchor-shoulderL');
    expect(dot.style.background).toBe('rgb(51, 51, 51)'); // #333
  });

  it('medium confidence (0.4–0.7) renders yellow fill', () => {
    const confidence = { shoulderL: 0.55 };
    render(<AnchorOverlay anchors={makeAnchors()} {...BASE_PROPS} confidence={confidence} manualMode />);
    const dot = screen.getByLabelText('anchor-shoulderL');
    expect(dot.style.background).toBe('rgb(245, 197, 24)'); // #f5c518
  });

  it('low confidence (<0.4) renders grey fill', () => {
    const confidence = { shoulderL: 0.2 };
    render(<AnchorOverlay anchors={makeAnchors()} {...BASE_PROPS} confidence={confidence} manualMode />);
    const dot = screen.getByLabelText('anchor-shoulderL');
    expect(dot.style.background).toBe('rgb(136, 136, 136)'); // #888
  });

  it('no confidence value renders white (#fff)', () => {
    render(<AnchorOverlay anchors={makeAnchors()} {...BASE_PROPS} manualMode />);
    const dot = screen.getByLabelText('anchor-shoulderL');
    expect(dot.style.background).toBe('rgb(255, 255, 255)');
  });
});
