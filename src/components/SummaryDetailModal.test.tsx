import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SummaryDetailModal } from './SummaryDetailModal';
import { useAppStore } from '../store/appStore';
import { createDefaultEntry } from '../types';
import { defaultAnchors } from '../lib/defaultAnchors';
import type { AppMeta } from '../types';

const FAKE_PHOTO = new Blob(['fake-image-data'], { type: 'image/png' });
const FAKE_META: AppMeta = { basePhoto: FAKE_PHOTO, poseLandmarks: null, createdAt: Date.now() };

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

function makeEntry() {
  const anchors = defaultAnchors(400, 800);
  const entry = createDefaultEntry('detail-id', anchors);
  return {
    ...entry,
    nickname: '테스트 드레스',
    shop: '드레스샵',
    dressNo: 'D-001',
    lightingNote: '자연광',
    quotes: { bride: '너무 예뻐요', groom: '잘 어울려요' },
    pros: ['핏이 좋음'],
    cons: ['가격이 비쌈'],
    ratings: { firstImpression: 5, fit: 4, comfort: 3, weddingFeel: 5 } as const,
  };
}

describe('SummaryDetailModal', () => {
  it('renders the nickname', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    const entry = makeEntry();
    render(<SummaryDetailModal entry={entry} onClose={vi.fn()} />);
    expect(screen.getByText('테스트 드레스')).toBeInTheDocument();
  });

  it('renders shop and dress number', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    const entry = makeEntry();
    render(<SummaryDetailModal entry={entry} onClose={vi.fn()} />);
    expect(screen.getByText('드레스샵')).toBeInTheDocument();
    expect(screen.getByText('D-001')).toBeInTheDocument();
  });

  it('renders lighting note', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    const entry = makeEntry();
    render(<SummaryDetailModal entry={entry} onClose={vi.fn()} />);
    expect(screen.getByText('자연광')).toBeInTheDocument();
  });

  it('renders bride and groom quotes', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    const entry = makeEntry();
    render(<SummaryDetailModal entry={entry} onClose={vi.fn()} />);
    expect(screen.getByText('"너무 예뻐요"')).toBeInTheDocument();
    expect(screen.getByText('"잘 어울려요"')).toBeInTheDocument();
  });

  it('renders star total', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    const entry = makeEntry();
    render(<SummaryDetailModal entry={entry} onClose={vi.fn()} />);
    expect(screen.getByText(/별점 합 17/)).toBeInTheDocument();
  });

  it('renders pros and cons', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    const entry = makeEntry();
    render(<SummaryDetailModal entry={entry} onClose={vi.fn()} />);
    expect(screen.getByText('핏이 좋음')).toBeInTheDocument();
    expect(screen.getByText('가격이 비쌈')).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    const onClose = vi.fn();
    const entry = makeEntry();
    render(<SummaryDetailModal entry={entry} onClose={onClose} />);
    screen.getByLabelText('닫기').click();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on Escape key', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    const onClose = vi.fn();
    const entry = makeEntry();
    render(<SummaryDetailModal entry={entry} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
