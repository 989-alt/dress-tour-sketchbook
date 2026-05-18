import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { createDefaultEntry } from '../types';
import { defaultAnchors } from '../lib/defaultAnchors';
import type { AppMeta } from '../types';
import Home from './Home';

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
    width: 800,
    height: 1200,
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

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<div>new</div>} />
        <Route path="/summary" element={<div>summary</div>} />
        <Route path="/edit/:id" element={<div>edit</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Home route', () => {
  it('renders the app header title', () => {
    useAppStore.setState({ meta: null, entries: [], hydrated: true });
    renderHome();
    expect(screen.getByText('드레스 투어 스케치북')).toBeInTheDocument();
  });

  it('renders upload button when no photo', () => {
    useAppStore.setState({ meta: null, entries: [], hydrated: true });
    renderHome();
    expect(screen.getByText('베이스 사진 업로드 + 포즈 검출')).toBeInTheDocument();
  });

  it('does not render "사진 변경" when no photo', () => {
    useAppStore.setState({ meta: null, entries: [], hydrated: true });
    renderHome();
    expect(screen.queryByText('사진 변경')).not.toBeInTheDocument();
  });

  it('renders "사진 변경" when photo exists', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderHome();
    expect(screen.getByText('사진 변경')).toBeInTheDocument();
  });

  it('renders "+ 새 드레스 추가" button', () => {
    useAppStore.setState({ meta: null, entries: [], hydrated: true });
    renderHome();
    expect(screen.getByText('+ 새 드레스 추가')).toBeInTheDocument();
  });

  it('"+ 새 드레스 추가" is disabled when no photo', () => {
    useAppStore.setState({ meta: null, entries: [], hydrated: true });
    renderHome();
    const btn = screen.getByText('+ 새 드레스 추가');
    expect(btn).toBeDisabled();
  });

  it('"+ 새 드레스 추가" is enabled when photo exists', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderHome();
    const btn = screen.getByText('+ 새 드레스 추가');
    expect(btn).not.toBeDisabled();
  });

  it('renders EntryCards when entries exist', () => {
    const anchors = defaultAnchors(120, 240);
    const e1 = { ...createDefaultEntry('id-1', anchors), nickname: '드레스 A' };
    const e2 = { ...createDefaultEntry('id-2', anchors), nickname: '드레스 B' };
    useAppStore.setState({ meta: FAKE_META, entries: [e1, e2], hydrated: true });
    renderHome();
    expect(screen.getByText('드레스 A')).toBeInTheDocument();
    expect(screen.getByText('드레스 B')).toBeInTheDocument();
  });

  it('renders footer navigation buttons', () => {
    useAppStore.setState({ meta: null, entries: [], hydrated: true });
    renderHome();
    expect(screen.getByText('요약 보기')).toBeInTheDocument();
    expect(screen.getByText('JSON 받기')).toBeInTheDocument();
    expect(screen.getByText('JSON 복원')).toBeInTheDocument();
  });
});
