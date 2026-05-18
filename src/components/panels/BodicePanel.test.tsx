import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BodicePanel } from './BodicePanel';
import type { WaistPosition, BodiceStructure, WaistAccent, ColorEnum } from '../../types';

const DEFAULT_VALUE = {
  waistPosition: 'natural' as WaistPosition,
  structure: 'softFit' as BodiceStructure,
  accent: 'none' as WaistAccent,
  accentColor: 'pureWhite' as ColorEnum,
};

describe('BodicePanel', () => {
  it('renders 5 waist position chips', () => {
    render(<BodicePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-waist-position'));
    expect(chips).toHaveLength(5);
  });

  it('renders 4 structure chips', () => {
    render(<BodicePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-structure'));
    expect(chips).toHaveLength(4);
  });

  it('renders 5 accent chips', () => {
    render(<BodicePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-accent'));
    expect(chips).toHaveLength(5);
  });

  it('renders 9 accent color swatches', () => {
    render(<BodicePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const swatches = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-accent-color'));
    expect(swatches).toHaveLength(9);
  });

  it('all 5 WaistPosition values are present', () => {
    render(<BodicePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    for (const v of ['natural', 'empire', 'basque', 'drop', 'asymmetric']) {
      const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-waist-position') === v);
      expect(btn).toBeDefined();
    }
  });

  it('all 4 BodiceStructure values are present', () => {
    render(<BodicePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    for (const s of ['corset', 'softFit', 'peplum', 'mockPeplum']) {
      const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-structure') === s);
      expect(btn).toBeDefined();
    }
  });

  it('all 5 WaistAccent values are present', () => {
    render(<BodicePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    for (const a of ['none', 'sash', 'ribbon', 'brooch', 'beadedBand']) {
      const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-accent') === a);
      expect(btn).toBeDefined();
    }
  });

  it('clicking a waist position chip calls onChange with new waistPosition', () => {
    const onChange = vi.fn();
    render(<BodicePanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-waist-position') === 'empire');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, waistPosition: 'empire' });
  });

  it('clicking a structure chip calls onChange with new structure', () => {
    const onChange = vi.fn();
    render(<BodicePanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-structure') === 'corset');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, structure: 'corset' });
  });

  it('clicking an accent chip calls onChange with new accent', () => {
    const onChange = vi.fn();
    render(<BodicePanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-accent') === 'sash');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, accent: 'sash' });
  });

  it('clicking an accent color swatch calls onChange with new accentColor', () => {
    const onChange = vi.fn();
    render(<BodicePanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-accent-color') === 'blush');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, accentColor: 'blush' });
  });

  it('selected waist position chip has border-rose-400 styling', () => {
    render(<BodicePanel value={{ ...DEFAULT_VALUE, waistPosition: 'empire' }} onChange={vi.fn()} />);
    const empire = screen.getAllByRole('button').find((b) => b.getAttribute('data-waist-position') === 'empire');
    const natural = screen.getAllByRole('button').find((b) => b.getAttribute('data-waist-position') === 'natural');
    expect(empire?.className).toContain('border-rose-400');
    expect(natural?.className).not.toContain('border-rose-400');
  });

  it('selected structure chip has border-rose-400 styling', () => {
    render(<BodicePanel value={{ ...DEFAULT_VALUE, structure: 'corset' }} onChange={vi.fn()} />);
    const corset = screen.getAllByRole('button').find((b) => b.getAttribute('data-structure') === 'corset');
    const softFit = screen.getAllByRole('button').find((b) => b.getAttribute('data-structure') === 'softFit');
    expect(corset?.className).toContain('border-rose-400');
    expect(softFit?.className).not.toContain('border-rose-400');
  });

  it('selected accent color swatch has border-rose-400 styling', () => {
    render(<BodicePanel value={{ ...DEFAULT_VALUE, accentColor: 'blush' }} onChange={vi.fn()} />);
    const blush = screen.getAllByRole('button').find((b) => b.getAttribute('data-accent-color') === 'blush');
    const ivory = screen.getAllByRole('button').find((b) => b.getAttribute('data-accent-color') === 'ivory');
    expect(blush?.className).toContain('border-rose-400');
    expect(ivory?.className).not.toContain('border-rose-400');
  });

  it('renders section headings in Korean', () => {
    render(<BodicePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('허리 위치')).toBeDefined();
    expect(screen.getByText('보디스 구조')).toBeDefined();
    expect(screen.getByText('허리 액센트')).toBeDefined();
    expect(screen.getByText('액센트 색상')).toBeDefined();
  });

  it('Korean structure labels are displayed', () => {
    render(<BodicePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('코르셋')).toBeDefined();
    expect(screen.getByText('소프트핏')).toBeDefined();
    expect(screen.getByText('페플럼')).toBeDefined();
    expect(screen.getByText('모크 페플럼')).toBeDefined();
  });

  it('Korean accent labels are displayed', () => {
    render(<BodicePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('없음')).toBeDefined();
    expect(screen.getByText('새시')).toBeDefined();
    expect(screen.getByText('리본')).toBeDefined();
    expect(screen.getByText('브로치')).toBeDefined();
    expect(screen.getByText('비즈 밴드')).toBeDefined();
  });
});
