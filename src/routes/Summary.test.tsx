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
    expect(options).toContain('별점합');
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

  it('renders the compare toggle button', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderSummary();
    expect(screen.getByText('비교')).toBeInTheDocument();
  });

  it('entering compare mode shows the action bar', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderSummary();
    fireEvent.click(screen.getByText('비교'));
    expect(screen.getByText(/비교할 드레스 2개를 선택하세요/)).toBeInTheDocument();
  });

  it('selecting one card in compare mode shows 1개 선택됨', () => {
    const entries = makeEntries();
    useAppStore.setState({ meta: FAKE_META, entries, hydrated: true });
    renderSummary();
    fireEvent.click(screen.getByText('비교'));
    // Click the card for 드레스 X
    const card = screen.getByText('드레스 X').closest('button');
    fireEvent.click(card!);
    expect(screen.getByText(/1개 선택됨/)).toBeInTheDocument();
  });

  it('비교하기 button is disabled until 2 cards are selected', () => {
    const entries = makeEntries();
    useAppStore.setState({ meta: FAKE_META, entries, hydrated: true });
    renderSummary();
    fireEvent.click(screen.getByText('비교'));
    const compareBtn = screen.getByText('비교하기');
    expect(compareBtn).toBeDisabled();
  });

  it('selecting 2 cards enables the 비교하기 button', () => {
    const entries = makeEntries();
    useAppStore.setState({ meta: FAKE_META, entries, hydrated: true });
    renderSummary();
    fireEvent.click(screen.getByText('비교'));
    const cardX = screen.getByText('드레스 X').closest('button');
    const cardY = screen.getByText('드레스 Y').closest('button');
    fireEvent.click(cardX!);
    fireEvent.click(cardY!);
    const compareBtn = screen.getByText('비교하기');
    expect(compareBtn).not.toBeDisabled();
  });

  it('clicking 비교하기 opens the compare modal', () => {
    const entries = makeEntries();
    useAppStore.setState({ meta: FAKE_META, entries, hydrated: true });
    renderSummary();
    fireEvent.click(screen.getByText('비교'));
    const cardX = screen.getByText('드레스 X').closest('button');
    const cardY = screen.getByText('드레스 Y').closest('button');
    fireEvent.click(cardX!);
    fireEvent.click(cardY!);
    fireEvent.click(screen.getByText('비교하기'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('clicking 비교 button again exits compare mode', () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    renderSummary();
    fireEvent.click(screen.getByText('비교'));
    expect(screen.getByText(/비교할 드레스 2개를 선택하세요/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('비교'));
    expect(screen.queryByText(/비교할 드레스 2개를 선택하세요/)).not.toBeInTheDocument();
  });
});
