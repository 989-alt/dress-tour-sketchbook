import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkirtPanel } from './SkirtPanel';
import type { SkirtTexture, SlitType, TrainLength } from '../../types';

const DEFAULT_VALUE = {
  texture: 'smooth' as SkirtTexture,
  layers: 3 as 2 | 3 | 4 | 5,
  slit: { type: 'none' as SlitType, height: 0 as 0 | 1 | 2 | 3 | 4 | 5 },
  train: 'none' as TrainLength,
};

describe('SkirtPanel', () => {
  it('renders 8 texture chips', () => {
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-texture'));
    expect(chips).toHaveLength(8);
  });

  it('renders 텍스처 section heading', () => {
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('텍스처')).toBeDefined();
  });

  it('renders 슬릿 section heading', () => {
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('슬릿')).toBeDefined();
  });

  it('renders 트레인 section heading', () => {
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('트레인')).toBeDefined();
  });

  it('renders 3 slit type chips (없음/사이드/프론트)', () => {
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-slit-type'));
    expect(chips).toHaveLength(3);
  });

  it('renders 5 train chips', () => {
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-train'));
    expect(chips).toHaveLength(5);
  });

  it('renders 6 slit height buttons (0-5)', () => {
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-slit-height'));
    expect(chips).toHaveLength(6);
  });

  it('tiered layers slider NOT shown when texture is not tiered', () => {
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const layerBtns = screen.queryAllByRole('button').filter((b) => b.hasAttribute('data-layers'));
    expect(layerBtns).toHaveLength(0);
  });

  it('tiered layers buttons (2-5) shown when texture=tiered', () => {
    render(<SkirtPanel value={{ ...DEFAULT_VALUE, texture: 'tiered' }} onChange={vi.fn()} />);
    const layerBtns = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-layers'));
    expect(layerBtns).toHaveLength(4);
  });

  it('티어드 단 수 heading shown only when tiered is selected', () => {
    const { rerender } = render(<SkirtPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.queryByText('티어드 단 수')).toBeNull();
    rerender(<SkirtPanel value={{ ...DEFAULT_VALUE, texture: 'tiered' }} onChange={vi.fn()} />);
    expect(screen.getByText('티어드 단 수')).toBeDefined();
  });

  it('clicking a texture chip calls onChange with new texture', () => {
    const onChange = vi.fn();
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-texture') === 'pleated');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, texture: 'pleated' });
  });

  it('clicking a slit type chip calls onChange with new slit type', () => {
    const onChange = vi.fn();
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-slit-type') === 'side');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, slit: { ...DEFAULT_VALUE.slit, type: 'side' } });
  });

  it('clicking slit height=3 calls onChange with height=3', () => {
    const onChange = vi.fn();
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-slit-height') === '3');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, slit: { ...DEFAULT_VALUE.slit, height: 3 } });
  });

  it('clicking a train chip calls onChange with new train', () => {
    const onChange = vi.fn();
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-train') === 'chapel');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, train: 'chapel' });
  });

  it('clicking layers=4 in tiered mode calls onChange with layers=4', () => {
    const onChange = vi.fn();
    render(<SkirtPanel value={{ ...DEFAULT_VALUE, texture: 'tiered' }} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-layers') === '4');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, texture: 'tiered', layers: 4 });
  });

  it('selected texture chip has border-blue-500 styling', () => {
    render(<SkirtPanel value={{ ...DEFAULT_VALUE, texture: 'gathered' }} onChange={vi.fn()} />);
    const gathered = screen.getAllByRole('button').find((b) => b.getAttribute('data-texture') === 'gathered');
    const smooth = screen.getAllByRole('button').find((b) => b.getAttribute('data-texture') === 'smooth');
    expect(gathered?.className).toContain('border-blue-500');
    expect(smooth?.className).not.toContain('border-blue-500');
  });

  it('renders Korean labels for all textures', () => {
    render(<SkirtPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('매끄럼')).toBeDefined();
    expect(screen.getByText('개더링')).toBeDefined();
    expect(screen.getByText('플리츠')).toBeDefined();
    expect(screen.getByText('티어드')).toBeDefined();
    expect(screen.getByText('레이어드 튤')).toBeDefined();
    expect(screen.getByText('러플')).toBeDefined();
    expect(screen.getByText('루시')).toBeDefined();
    expect(screen.getByText('비대칭 드레이프')).toBeDefined();
  });
});
