import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoUploadModal } from './PhotoUploadModal';

beforeAll(() => {
  if (!globalThis.URL.createObjectURL) {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:fake-url');
    globalThis.URL.revokeObjectURL = vi.fn();
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

describe('PhotoUploadModal', () => {
  it('renders file input (hidden)', () => {
    const onClose = vi.fn();
    const { container } = render(<PhotoUploadModal onClose={onClose} />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('renders "사진 선택" button on idle step', () => {
    render(<PhotoUploadModal onClose={vi.fn()} />);
    expect(screen.getByText('사진 선택')).toBeInTheDocument();
  });

  it('calls onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    render(<PhotoUploadModal onClose={onClose} />);
    screen.getByLabelText('취소').click();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<PhotoUploadModal onClose={onClose} />);
    const backdrop = container.firstElementChild as HTMLElement;
    fireEvent.click(backdrop, { target: backdrop });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders title text', () => {
    render(<PhotoUploadModal onClose={vi.fn()} />);
    expect(screen.getByText('베이스 사진 업로드')).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed (idle status)', () => {
    const onClose = vi.fn();
    render(<PhotoUploadModal onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
