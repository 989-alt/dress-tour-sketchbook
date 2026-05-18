import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPanel } from './ColorPanel';
import type { ColorEnum } from '../../types';

const DEFAULT_VALUE = {
  primary: 'pureWhite' as ColorEnum,
  gradient: 'solid' as const,
  accent: 'pureWhite' as ColorEnum,
};

describe('ColorPanel', () => {
  it('renders 3 sections: 메인 색상, 그라데이션, 액센트 색상', () => {
    render(<ColorPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('메인 색상')).toBeDefined();
    expect(screen.getByText('그라데이션')).toBeDefined();
    expect(screen.getByText('액센트 색상')).toBeDefined();
  });

  it('renders 9 primary color swatches', () => {
    render(<ColorPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const swatches = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('data-section') === 'primary',
    );
    expect(swatches).toHaveLength(9);
  });

  it('renders 9 accent color swatches', () => {
    render(<ColorPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const swatches = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('data-section') === 'accent',
    );
    expect(swatches).toHaveLength(9);
  });

  it('clicking a primary swatch fires onChange with new primary color', () => {
    const onChange = vi.fn();
    render(<ColorPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-section') === 'primary' && b.getAttribute('data-color') === 'blush',
    );
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, primary: 'blush' });
  });

  it('clicking an accent swatch fires onChange with new accent color', () => {
    const onChange = vi.fn();
    render(<ColorPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-section') === 'accent' && b.getAttribute('data-color') === 'gold',
    );
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, accent: 'gold' });
  });

  it('solid is selected by default — 단색 button has border-blue-500', () => {
    render(<ColorPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const solidBtn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-gradient') === 'solid',
    );
    expect(solidBtn?.className).toContain('border-blue-500');
  });

  it('secondary swatches are NOT shown when gradient=solid', () => {
    render(<ColorPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const secondary = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('data-section') === 'secondary',
    );
    expect(secondary).toHaveLength(0);
  });

  it('clicking 옴브레 toggle fires onChange with gradient=ombre', () => {
    const onChange = vi.fn();
    render(<ColorPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const ombreBtn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-gradient') === 'ombre',
    );
    fireEvent.click(ombreBtn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, gradient: 'ombre' });
  });

  it('secondary swatches ARE shown when gradient=ombre', () => {
    render(
      <ColorPanel
        value={{ ...DEFAULT_VALUE, gradient: 'ombre', secondary: 'blush' }}
        onChange={vi.fn()}
      />,
    );
    const secondary = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('data-section') === 'secondary',
    );
    expect(secondary).toHaveLength(9);
  });

  it('clicking a secondary swatch fires onChange with new secondary color', () => {
    const onChange = vi.fn();
    const ombreValue = { ...DEFAULT_VALUE, gradient: 'ombre' as const, secondary: 'ivory' as ColorEnum };
    render(<ColorPanel value={ombreValue} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-section') === 'secondary' && b.getAttribute('data-color') === 'champagne',
    );
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...ombreValue, secondary: 'champagne' });
  });

  it('clicking 단색 from ombre removes secondary from value', () => {
    const onChange = vi.fn();
    const ombreValue = { ...DEFAULT_VALUE, gradient: 'ombre' as const, secondary: 'blush' as ColorEnum };
    render(<ColorPanel value={ombreValue} onChange={onChange} />);
    const solidBtn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-gradient') === 'solid',
    );
    fireEvent.click(solidBtn!);
    const called = onChange.mock.calls[0][0] as Record<string, unknown>;
    expect(called.gradient).toBe('solid');
    expect('secondary' in called).toBe(false);
  });

  it('보조 색상 label is shown when gradient=ombre', () => {
    render(
      <ColorPanel
        value={{ ...DEFAULT_VALUE, gradient: 'ombre' }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('보조 색상')).toBeDefined();
  });
});
