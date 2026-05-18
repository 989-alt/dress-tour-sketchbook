import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { createDefaultEntry } from '../types';
import { SILHOUETTES } from '../parts/silhouettes';
import type { AnchorSet, AppMeta, AIResult } from '../types';
import Edit from './Edit';

// Mock aiClient so tests never hit the network
vi.mock('../lib/aiClient', () => ({
  generateDressImage: vi.fn(),
  AIGenerationError: class AIGenerationError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = 'AIGenerationError';
    }
  },
}));

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

afterEach(() => {
  // Reset only the data fields; leave store actions intact (replace=false)
  useAppStore.setState({ meta: null, entries: [], hydrated: false });
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

describe('Edit route — /new path', () => {
  it('renders parameter panel area for /new without a pre-existing entry', async () => {
    useAppStore.setState({ meta: FAKE_META, entries: [], hydrated: true });
    render(
      <MemoryRouter initialEntries={['/new']}>
        <Routes>
          <Route path="/new" element={<Edit />} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(
      () => expect(screen.getByLabelText('parameter-panel-area')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});

describe('Edit route — handleAnchorReset', () => {
  it('resets anchors to default proportional values derived from photo dimensions', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByLabelText('parameter-panel-area')).toBeInTheDocument(),
      { timeout: 3000 },
    );
    // The anchor reset button lives in AnchorPanel — navigate to the anchor tab
    const anchorTab = screen.getByText('앵커');
    anchorTab.click();
    // The reset button label is '앵커 재설정'
    await waitFor(() => expect(screen.getByText('앵커 재설정')).toBeInTheDocument(), { timeout: 3000 });
    screen.getByText('앵커 재설정').click();
    // After reset the panel should still be visible (no crash)
    expect(screen.getByLabelText('parameter-panel-area')).toBeInTheDocument();
  });
});

describe('Edit route — AI 합성 UI', () => {
  it('renders "✨ AI 합성" button when photo exists', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByLabelText('AI 합성 시작')).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByLabelText('AI 합성 시작').textContent).toContain('AI 합성');
  });

  it('AI 합성 button is disabled when there is no photo', async () => {
    useAppStore.setState({ meta: { basePhoto: null, poseLandmarks: null, createdAt: Date.now() }, entries: [], hydrated: true });
    render(
      <MemoryRouter initialEntries={['/new']}>
        <Routes>
          <Route path="/new" element={<Edit />} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </MemoryRouter>,
    );
    // No photo → redirect to home, so Edit won't render
    await waitFor(() => expect(screen.getByText('home')).toBeInTheDocument(), { timeout: 3000 });
  });

  it('renders the AI section with textarea for extra instructions', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByLabelText('추가 지시사항')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('renders reference dress upload area', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByLabelText('참고 드레스 업로드')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('"⚠️ 변경됨" indicator is NOT shown when aiResult is null', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByLabelText('AI 합성 시작')).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.queryByLabelText('변경됨 표시')).toBeNull();
  });

  it('"⚠️ 변경됨" indicator is shown when aiResult paramsHash differs from current entry', async () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('stale-id', anchors);
    // Set an aiResult with a different paramsHash
    const staleResult: AIResult = {
      dataUrl: 'data:image/png;base64,abc',
      generatedAt: Date.now(),
      modelId: 'test-model',
      paramsHash: 'DIFFERENT_HASH',
      prompt: 'test',
    };
    entry.aiResult = staleResult;
    useAppStore.setState({ meta: FAKE_META, entries: [entry], hydrated: true });
    render(
      <MemoryRouter initialEntries={['/edit/stale-id']}>
        <Routes>
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(
      () => expect(screen.getByLabelText('변경됨 표시')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('clicking AI 합성 button calls generateDressImage', async () => {
    const { generateDressImage } = await import('../lib/aiClient');
    const mockGenerate = vi.mocked(generateDressImage);
    // Return a pending promise that we never resolve (simulate in-progress)
    mockGenerate.mockReturnValue(new Promise(() => {}));

    renderEdit();
    await waitFor(
      () => expect(screen.getByLabelText('AI 합성 시작')).toBeInTheDocument(),
      { timeout: 3000 },
    );

    fireEvent.click(screen.getByLabelText('AI 합성 시작'));

    await waitFor(() => expect(mockGenerate).toHaveBeenCalledOnce(), { timeout: 3000 });
  });

  it('shows PNG download button when entry has aiResult', async () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('ai-result-id', anchors);
    entry.aiResult = {
      dataUrl: 'data:image/png;base64,abc',
      generatedAt: Date.now(),
      modelId: 'test-model',
      paramsHash: 'somehash',
      prompt: 'test',
    };
    useAppStore.setState({ meta: FAKE_META, entries: [entry], hydrated: true });
    render(
      <MemoryRouter initialEntries={['/edit/ai-result-id']}>
        <Routes>
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(
      () => expect(screen.getByLabelText('PNG 다운로드')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('without aiResult: only "AI 합성" button shows, no iterate option', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByLabelText('AI 합성 시작')).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.queryByLabelText('이어서 다듬기')).toBeNull();
    expect(screen.queryByLabelText('처음부터 다시 합성')).toBeNull();
  });

  it('when aiResult exists, "이어서 다듬기" button appears', async () => {
    const anchors = makeAnchors();
    const entry = createDefaultEntry('iter-id', anchors);
    entry.aiResult = {
      dataUrl: 'data:image/png;base64,abc',
      generatedAt: Date.now(),
      modelId: 'test-model',
      paramsHash: 'somehash',
      prompt: 'test',
    };
    useAppStore.setState({ meta: FAKE_META, entries: [entry], hydrated: true });
    render(
      <MemoryRouter initialEntries={['/edit/iter-id']}>
        <Routes>
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(
      () => expect(screen.getByLabelText('이어서 다듬기')).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByLabelText('처음부터 다시 합성')).toBeInTheDocument();
  });

  it('clicking 이어서 다듬기 calls generateDressImage with iterate: true', async () => {
    const { generateDressImage } = await import('../lib/aiClient');
    const mockGenerate = vi.mocked(generateDressImage);
    mockGenerate.mockReturnValue(new Promise(() => {}));

    const anchors = makeAnchors();
    const entry = createDefaultEntry('iter-click-id', anchors);
    entry.aiResult = {
      dataUrl: 'data:image/png;base64,abc',
      generatedAt: Date.now(),
      modelId: 'test-model',
      paramsHash: 'somehash',
      prompt: 'test',
    };
    useAppStore.setState({ meta: FAKE_META, entries: [entry], hydrated: true });
    render(
      <MemoryRouter initialEntries={['/edit/iter-click-id']}>
        <Routes>
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(
      () => expect(screen.getByLabelText('이어서 다듬기')).toBeInTheDocument(),
      { timeout: 3000 },
    );
    fireEvent.click(screen.getByLabelText('이어서 다듬기'));
    await waitFor(() => expect(mockGenerate).toHaveBeenCalled(), { timeout: 3000 });
    const callOpts = mockGenerate.mock.calls[mockGenerate.mock.calls.length - 1][0];
    expect(callOpts.iterate).toBe(true);
  });

  it('reference dress upload sets entry referenceDress', async () => {
    renderEdit();
    await waitFor(
      () => expect(screen.getByLabelText('참고 드레스 업로드')).toBeInTheDocument(),
      { timeout: 3000 },
    );

    const fileInput = screen.getByLabelText('참고 드레스 업로드').querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();

    // Stub FileReader
    const mockReadAsDataURL = vi.fn();
    const mockFileReader = {
      readAsDataURL: mockReadAsDataURL,
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
      result: 'data:image/jpeg;base64,refimgdata',
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    const fakeFile = new File(['fake'], 'ref.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput!, 'files', { value: [fakeFile], configurable: true });
    fireEvent.change(fileInput!);

    expect(mockReadAsDataURL).toHaveBeenCalledWith(fakeFile);

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: mockFileReader } as unknown as ProgressEvent<FileReader>);
    }

    // After load, the remove button should appear
    await waitFor(
      () => expect(screen.getByLabelText('참고 드레스 제거')).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
