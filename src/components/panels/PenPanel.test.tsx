import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PenPanel } from './PenPanel';
import type { RegionPrompt } from '../../types';

const DEFAULT_PROPS = {
  brushSize: 'medium' as const,
  color: 'black' as const,
  acceptFinger: false,
  onBrushSizeChange: vi.fn(),
  onColorChange: vi.fn(),
  onAcceptFingerChange: vi.fn(),
  onUndo: vi.fn(),
  onClearInProgress: vi.fn(),
  onFinishRegion: vi.fn(() => null),
  savedRegions: [] as RegionPrompt[],
  onRegionAdd: vi.fn(),
  onRegionDelete: vi.fn(),
};

const SAMPLE_REGION: RegionPrompt = {
  id: 'reg-1',
  pathData: 'M 0.0 0.0 L 10.0 10.0',
  prompt: '레이스 추가',
  hue: 0,
  createdAt: 1000,
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

  it('does NOT render eraser toggle', () => {
    render(<PenPanel {...DEFAULT_PROPS} />);
    expect(screen.queryByTestId('eraser-toggle')).toBeNull();
    expect(screen.queryByText('지우개')).toBeNull();
  });

  it('renders "영역 완료" button', () => {
    render(<PenPanel {...DEFAULT_PROPS} />);
    expect(screen.getByTestId('finish-region')).toBeInTheDocument();
  });

  it('clicking 영역 완료 when onFinishRegion returns null does NOT show prompt form', () => {
    render(<PenPanel {...DEFAULT_PROPS} onFinishRegion={() => null} />);
    fireEvent.click(screen.getByTestId('finish-region'));
    expect(screen.queryByTestId('prompt-form')).toBeNull();
  });

  it('clicking 영역 완료 when onFinishRegion returns pathData shows prompt form', () => {
    render(<PenPanel {...DEFAULT_PROPS} onFinishRegion={() => 'M 0 0 L 10 10'} />);
    fireEvent.click(screen.getByTestId('finish-region'));
    expect(screen.getByTestId('prompt-form')).toBeInTheDocument();
  });

  it('typing prompt + clicking 저장 calls onRegionAdd with correct data', () => {
    const onRegionAdd = vi.fn();
    render(
      <PenPanel
        {...DEFAULT_PROPS}
        onFinishRegion={() => 'M 0 0 L 10 10'}
        onRegionAdd={onRegionAdd}
        savedRegions={[]}
      />,
    );
    fireEvent.click(screen.getByTestId('finish-region'));
    fireEvent.change(screen.getByLabelText('영역 프롬프트 입력'), { target: { value: '레이스 추가' } });
    fireEvent.click(screen.getByTestId('save-region'));
    expect(onRegionAdd).toHaveBeenCalledOnce();
    const arg = onRegionAdd.mock.calls[0][0] as RegionPrompt;
    expect(arg.pathData).toBe('M 0 0 L 10 10');
    expect(arg.prompt).toBe('레이스 추가');
    expect(arg.hue).toBe(0);
    expect(typeof arg.id).toBe('string');
  });

  it('clicking 취소 hides prompt form without calling onRegionAdd', () => {
    const onRegionAdd = vi.fn();
    render(
      <PenPanel
        {...DEFAULT_PROPS}
        onFinishRegion={() => 'M 0 0 L 10 10'}
        onRegionAdd={onRegionAdd}
      />,
    );
    fireEvent.click(screen.getByTestId('finish-region'));
    fireEvent.click(screen.getByTestId('cancel-region'));
    expect(screen.queryByTestId('prompt-form')).toBeNull();
    expect(onRegionAdd).not.toHaveBeenCalled();
  });

  it('saved regions list renders each region', () => {
    render(<PenPanel {...DEFAULT_PROPS} savedRegions={[SAMPLE_REGION]} />);
    expect(screen.getByTestId('saved-regions-list')).toBeInTheDocument();
    expect(screen.getByText(/영역 1/)).toBeInTheDocument();
  });

  it('clicking delete on saved region calls onRegionDelete with region id', () => {
    const onRegionDelete = vi.fn();
    render(
      <PenPanel {...DEFAULT_PROPS} savedRegions={[SAMPLE_REGION]} onRegionDelete={onRegionDelete} />,
    );
    fireEvent.click(screen.getByLabelText('영역 1 삭제'));
    expect(onRegionDelete).toHaveBeenCalledWith(SAMPLE_REGION.id);
  });

  it('clicking undo calls onUndo', () => {
    const onUndo = vi.fn();
    render(<PenPanel {...DEFAULT_PROPS} onUndo={onUndo} />);
    fireEvent.click(screen.getByText('실행 취소'));
    expect(onUndo).toHaveBeenCalled();
  });

  it('clicking 전체 취소 calls onClearInProgress', () => {
    const onClearInProgress = vi.fn();
    render(<PenPanel {...DEFAULT_PROPS} onClearInProgress={onClearInProgress} />);
    fireEvent.click(screen.getByText('전체 취소'));
    expect(onClearInProgress).toHaveBeenCalled();
  });
});
