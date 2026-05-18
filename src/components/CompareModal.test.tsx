import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompareModal } from './CompareModal';
import { createDefaultEntry } from '../types';
import { defaultAnchors } from '../lib/defaultAnchors';
import { useAppStore } from '../store/appStore';

const FAKE_PHOTO = new Blob(['fake-image-data'], { type: 'image/png' });

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
  globalThis.createImageBitmap = vi.fn().mockResolvedValue({
    width: 400,
    height: 800,
    close: vi.fn(),
  });
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    drawImage: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => new ImageData(1, 1)),
    putImageData: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.toBlob = vi.fn((cb) => {
    cb(new Blob(['png'], { type: 'image/png' }));
  });
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,fake');
  const OriginalImage = globalThis.Image;
  globalThis.Image = class extends OriginalImage {
    constructor() {
      super();
      setTimeout(() => this.onload?.call(this, new Event('load')), 0);
    }
  };
});

afterEach(() => {
  useAppStore.setState({ meta: null, entries: [], hydrated: false });
});

function makeEntry(id: string, nickname: string, shop: string) {
  const anchors = defaultAnchors(400, 800);
  return {
    ...createDefaultEntry(id, anchors),
    nickname,
    shop,
    pros: ['예쁨'],
    cons: ['비쌈'],
  };
}

describe('CompareModal', () => {
  it('renders both entry nicknames', () => {
    const entryA = makeEntry('a', '드레스 A', '샵A');
    const entryB = makeEntry('b', '드레스 B', '샵B');
    const onClose = vi.fn();

    render(
      <CompareModal
        entryA={entryA}
        entryB={entryB}
        photo={null}
        photoWidth={400}
        photoHeight={800}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('드레스 A')).toBeInTheDocument();
    expect(screen.getByText('드레스 B')).toBeInTheDocument();
  });

  it('renders both shop names', () => {
    const entryA = makeEntry('a', '드레스 A', '샵A');
    const entryB = makeEntry('b', '드레스 B', '샵B');
    const onClose = vi.fn();

    render(
      <CompareModal
        entryA={entryA}
        entryB={entryB}
        photo={null}
        photoWidth={400}
        photoHeight={800}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('샵A')).toBeInTheDocument();
    expect(screen.getByText('샵B')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const entryA = makeEntry('a', 'A', 'Shop');
    const entryB = makeEntry('b', 'B', 'Shop');
    const onClose = vi.fn();

    render(
      <CompareModal
        entryA={entryA}
        entryB={entryB}
        photo={null}
        photoWidth={400}
        photoHeight={800}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key is pressed', () => {
    const entryA = makeEntry('a', 'A', 'Shop');
    const entryB = makeEntry('b', 'B', 'Shop');
    const onClose = vi.fn();

    render(
      <CompareModal
        entryA={entryA}
        entryB={entryB}
        photo={null}
        photoWidth={400}
        photoHeight={800}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has dialog role', () => {
    const entryA = makeEntry('a', 'A', 'Shop');
    const entryB = makeEntry('b', 'B', 'Shop');

    render(
      <CompareModal
        entryA={entryA}
        entryB={entryB}
        photo={null}
        photoWidth={400}
        photoHeight={800}
        onClose={() => {}}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders DressCanvas when photo is provided', () => {
    const entryA = makeEntry('a', 'A', 'Shop');
    const entryB = makeEntry('b', 'B', 'Shop');

    render(
      <CompareModal
        entryA={entryA}
        entryB={entryB}
        photo={FAKE_PHOTO}
        photoWidth={400}
        photoHeight={800}
        onClose={() => {}}
      />,
    );

    // DressCanvas renders SVG elements
    expect(document.querySelector('svg')).toBeTruthy();
  });

  it('renders footer close button', () => {
    const entryA = makeEntry('a', 'A', 'Shop');
    const entryB = makeEntry('b', 'B', 'Shop');

    render(
      <CompareModal
        entryA={entryA}
        entryB={entryB}
        photo={null}
        photoWidth={400}
        photoHeight={800}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText('닫기')).toBeInTheDocument();
  });
});
