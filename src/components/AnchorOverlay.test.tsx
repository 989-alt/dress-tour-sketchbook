import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnchorOverlay } from './AnchorOverlay';
import { MESH_ANCHOR_ORDER } from '../lib/warp';
import type { AnchorSet } from '../types';

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
