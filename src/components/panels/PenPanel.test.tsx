import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PenPanel } from './PenPanel';

const DEFAULT_PROPS = {
  brushSize: 'medium' as const,
  color: 'black' as const,
  eraser: false,
  acceptFinger: false,
  onBrushSizeChange: vi.fn(),
  onColorChange: vi.fn(),
  onEraserChange: vi.fn(),
  onAcceptFingerChange: vi.fn(),
  onUndo: vi.fn(),
  onClear: vi.fn(),
};

describe('PenPanel', () => {
  it('renders all three brush size buttons', () => {
    render(<PenPanel {...DEFAULT_PROPS} />);
    expect(screen.getByText('얇게')).toBeInTheDocument();
    expect(screen.getByText('중간')).toBeInTheDocument();
    expect(screen.getByText('굵게')).toBeInTheDocument();
  });

  it('renders all three color swatches', () => {
    render(<PenPanel {...DEFAULT_PROPS} />);
    expect(screen.getByLabelText('검정')).toBeInTheDocument();
    expect(screen.getByLabelText('네이비')).toBeInTheDocument();
    expect(screen.getByLabelText('빨강')).toBeInTheDocument();
  });

  it('clicking thin brush calls onBrushSizeChange with thin', () => {
    const onBrushSizeChange = vi.fn();
    render(<PenPanel {...DEFAULT_PROPS} onBrushSizeChange={onBrushSizeChange} />);
    fireEvent.click(screen.getByText('얇게'));
    expect(onBrushSizeChange).toHaveBeenCalledWith('thin');
  });

  it('clicking navy color calls onColorChange with navy', () => {
    const onColorChange = vi.fn();
    render(<PenPanel {...DEFAULT_PROPS} onColorChange={onColorChange} />);
    fireEvent.click(screen.getByLabelText('네이비'));
    expect(onColorChange).toHaveBeenCalledWith('navy');
  });

  it('clicking eraser toggle calls onEraserChange', () => {
    const onEraserChange = vi.fn();
    render(<PenPanel {...DEFAULT_PROPS} onEraserChange={onEraserChange} />);
    fireEvent.click(screen.getByTestId('eraser-toggle'));
    expect(onEraserChange).toHaveBeenCalledWith(true);
  });

  it('clicking undo calls onUndo', () => {
    const onUndo = vi.fn();
    render(<PenPanel {...DEFAULT_PROPS} onUndo={onUndo} />);
    fireEvent.click(screen.getByText('실행 취소'));
    expect(onUndo).toHaveBeenCalled();
  });

  it('clicking clear calls onClear', () => {
    const onClear = vi.fn();
    render(<PenPanel {...DEFAULT_PROPS} onClear={onClear} />);
    fireEvent.click(screen.getByText('지우기'));
    expect(onClear).toHaveBeenCalled();
  });
});
