import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { createDefaultEntry } from '../types';
import { defaultAnchors } from '../lib/defaultAnchors';
import type { AppMeta } from '../types';
import Summary from './Summary';

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

function renderSummary() {
  return render(
    <MemoryRouter initialEntries={['/summary']}>
      <Routes>
        <Route path="/summary" element={<Summary />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function makeEntries() {
  const anchors = defaultAnchors(120, 240);
  const e1 = { ...createDefaultEntry('id-1', anchors), nickname: '드레스 X', shop: '샵A' };
  const e2 = { ...createDefaultEntry('id-2', anchors), nickname: '드레스 Y', shop: '샵B' };
  return [e1, e2];
}

describe('Summary route', () => {
  it('renders the page title "요약"', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderSummary();
    expect(screen.getByText('요약')).toBeInTheDocument();
  });

  it('renders the sort selector', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderSummary();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('sort selector has expected options', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderSummary();
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.text);
    expect(options).toContain('별점 합');
    expect(options).toContain('작성 시간');
    expect(options).toContain('별명');
    expect(options).toContain('매장');
  });

  it('renders EntryCards for each entry', () => {
    const entries = makeEntries();
    useAppStore.setState({ meta: FAKE_META, entries, hydrated: true });
    renderSummary();
    expect(screen.getByText('드레스 X')).toBeInTheDocument();
    expect(screen.getByText('드레스 Y')).toBeInTheDocument();
  });

  it('shows empty state message when no entries', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderSummary();
    expect(screen.getByText('아직 드레스가 없습니다.')).toBeInTheDocument();
  });

  it('clicking an EntryCard opens the detail modal', () => {
    const entries = makeEntries();
    useAppStore.setState({ meta: FAKE_META, entries, hydrated: true });
    renderSummary();
    // Click the card containing the first nickname
    const nicknamEl = screen.getByText('드레스 X');
    const cardBtn = nicknamEl.closest('button');
    expect(cardBtn).toBeTruthy();
    fireEvent.click(cardBtn!);
    // Detail modal should appear (renders a role=dialog)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders back arrow button', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderSummary();
    expect(screen.getByLabelText('홈으로')).toBeInTheDocument();
  });

  it('renders footer export buttons', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderSummary();
    expect(screen.getByText('이미지로 내보내기')).toBeInTheDocument();
    expect(screen.getByText('JSON 받기')).toBeInTheDocument();
  });
});
