import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { createDefaultEntry } from '../types';
import { SILHOUETTES } from '../parts/silhouettes';
import type { AnchorSet, AppMeta } from '../types';
import Edit from './Edit';

// jsdom stubs required for DressCanvas / SketchOverlay / loadImageWithCorrectOrientation
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
  // Stub createImageBitmap used by loadImageWithCorrectOrientation
  globalThis.createImageBitmap = vi.fn().mockResolvedValue({
    width: 800,
    height: 1200,
    close: vi.fn(),
  });

  // Stub canvas APIs
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

  // Stub Image so the promise inside loadImageWithCorrectOrientation resolves
  const OriginalImage = globalThis.Image;
  globalThis.Image = class extends OriginalImage {
    constructor() {
      super();
      // resolve onload on next tick
      setTimeout(() => this.onload?.call(this, new Event('load')), 0);
    }
  };
});

function makeAnchors(): AnchorSet {
  return { ...SILHOUETTES['aline'].referencePose.anchors } as AnchorSet;
}

const FAKE_PHOTO = new Blob(['fake-image-data'], { type: 'image/png' });

const FAKE_META: AppMeta = {
  basePhoto: FAKE_PHOTO,
  poseLandmarks: null,
  createdAt: Date.now(),
};

function setupStore(entryId = 'test-id') {
  const anchors = makeAnchors();
  const entry = createDefaultEntry(entryId, anchors);
  useAppStore.setState({
    meta: FAKE_META,
    entries: [entry],
    hydrated: true,
  });
  return entry;
}

function renderEdit(entryId = 'test-id') {
  setupStore(entryId);
  return render(
    <MemoryRouter initialEntries={[`/edit/${entryId}`]}>
      <Routes>
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Edit route — smoke test', () => {
  it('renders the parameter panel area once loaded', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByLabelText('parameter-panel-area')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('renders the 5 tab buttons', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByText('기본')).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByText('실루엣')).toBeInTheDocument();
    expect(screen.getByText('앵커')).toBeInTheDocument();
    expect(screen.getByText('펜')).toBeInTheDocument();
    expect(screen.getByText('메모')).toBeInTheDocument();
  });

  it('shows the back arrow button', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByLabelText('뒤로')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('shows the autosave indicator', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByText('저장됨')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
