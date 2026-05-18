import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SleevePanel } from './SleevePanel';
import type { SleeveType, SleeveMaterial } from '../../types';

const DEFAULT_VALUE = { type: 'sleeveless' as SleeveType, material: 'opaque' as SleeveMaterial };

describe('SleevePanel', () => {
  it('renders 10 sleeve type chips', () => {
    render(<SleevePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const sleeves = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-sleeve'));
    expect(sleeves).toHaveLength(10);
  });

  it('renders 4 material chips', () => {
    render(<SleevePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const materials = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-material'));
    expect(materials).toHaveLength(4);
  });

  it('all 10 SleeveType values are present', () => {
    render(<SleevePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const types = [
      'sleeveless', 'cap', 'short', 'threeQuarter', 'long',
      'bishop', 'puff', 'bell', 'legOfMutton', 'illusion',
    ];
    for (const t of types) {
      const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-sleeve') === t);
      expect(btn).toBeDefined();
    }
  });

  it('all 4 SleeveMaterial values are present', () => {
    render(<SleevePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    for (const mat of ['opaque', 'sheer', 'lace', 'beaded']) {
      const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-material') === mat);
      expect(btn).toBeDefined();
    }
  });

  it('clicking a sleeve type chip calls onChange with the new type', () => {
    const onChange = vi.fn();
    render(<SleevePanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-sleeve') === 'cap');
    expect(btn).toBeDefined();
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ type: 'cap', material: 'opaque' });
  });

  it('clicking a material chip calls onChange with the new material', () => {
    const onChange = vi.fn();
    render(<SleevePanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-material') === 'sheer');
    expect(btn).toBeDefined();
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ type: 'sleeveless', material: 'sheer' });
  });

  it('clicking long sleeve type preserves current material', () => {
    const onChange = vi.fn();
    const value = { type: 'short' as SleeveType, material: 'lace' as SleeveMaterial };
    render(<SleevePanel value={value} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-sleeve') === 'long');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ type: 'long', material: 'lace' });
  });

  it('clicking beaded material preserves current sleeve type', () => {
    const onChange = vi.fn();
    const value = { type: 'bell' as SleeveType, material: 'opaque' as SleeveMaterial };
    render(<SleevePanel value={value} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-material') === 'beaded');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ type: 'bell', material: 'beaded' });
  });

  it('selected sleeve chip has border-rose-400 styling', () => {
    render(<SleevePanel value={{ type: 'cap', material: 'opaque' }} onChange={vi.fn()} />);
    const cap = screen.getAllByRole('button').find((b) => b.getAttribute('data-sleeve') === 'cap');
    const long = screen.getAllByRole('button').find((b) => b.getAttribute('data-sleeve') === 'long');
    expect(cap?.className).toContain('border-rose-400');
    expect(long?.className).not.toContain('border-rose-400');
  });

  it('selected material chip has border-rose-400 styling', () => {
    render(<SleevePanel value={{ type: 'cap', material: 'sheer' }} onChange={vi.fn()} />);
    const sheer = screen.getAllByRole('button').find((b) => b.getAttribute('data-material') === 'sheer');
    const lace = screen.getAllByRole('button').find((b) => b.getAttribute('data-material') === 'lace');
    expect(sheer?.className).toContain('border-rose-400');
    expect(lace?.className).not.toContain('border-rose-400');
  });

  it('Korean material labels are displayed', () => {
    render(<SleevePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('불투명')).toBeDefined();
    expect(screen.getByText('시스루')).toBeDefined();
    expect(screen.getByText('레이스')).toBeDefined();
    expect(screen.getByText('비즈')).toBeDefined();
  });

  it('Korean sleeve labels are displayed', () => {
    render(<SleevePanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('민소매')).toBeDefined();
    expect(screen.getByText('캡')).toBeDefined();
    expect(screen.getByText('긴')).toBeDefined();
  });
});
