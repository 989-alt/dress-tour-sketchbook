import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackPanel } from './BackPanel';
import type { BackType } from '../../types';

const DEFAULT_VALUE = {
  type: 'closed' as BackType,
  openDepth: 0 as 0 | 1 | 2 | 3 | 4 | 5,
};

describe('BackPanel', () => {
  it('renders 8 back type chips', () => {
    render(<BackPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-back-type'));
    expect(chips).toHaveLength(8);
  });

  it('all 8 BackType values are present as chips', () => {
    render(<BackPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const allTypes: BackType[] = ['closed', 'vBack', 'illusionBack', 'openBack', 'keyhole', 'buttonRow', 'laceUpCorset', 'drape'];
    for (const bt of allTypes) {
      const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-back-type') === bt);
      expect(btn).toBeDefined();
    }
  });

  it('openDepth buttons NOT shown when type is closed', () => {
    render(<BackPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const depthBtns = screen.queryAllByRole('button').filter((b) => b.hasAttribute('data-open-depth'));
    expect(depthBtns).toHaveLength(0);
  });

  it('openDepth buttons NOT shown when type is vBack', () => {
    render(<BackPanel value={{ type: 'vBack', openDepth: 0 }} onChange={vi.fn()} />);
    const depthBtns = screen.queryAllByRole('button').filter((b) => b.hasAttribute('data-open-depth'));
    expect(depthBtns).toHaveLength(0);
  });

  it('openDepth buttons (0-5) shown when type is openBack', () => {
    render(<BackPanel value={{ type: 'openBack', openDepth: 2 }} onChange={vi.fn()} />);
    const depthBtns = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-open-depth'));
    expect(depthBtns).toHaveLength(6);
  });

  it('clicking a back type chip calls onChange with new type', () => {
    const onChange = vi.fn();
    render(<BackPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-back-type') === 'drape');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, type: 'drape' });
  });

  it('clicking openBack chip calls onChange with type=openBack', () => {
    const onChange = vi.fn();
    render(<BackPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-back-type') === 'openBack');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, type: 'openBack' });
  });

  it('clicking depth button fires onChange with new openDepth', () => {
    const onChange = vi.fn();
    render(<BackPanel value={{ type: 'openBack', openDepth: 0 }} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find((b) => b.getAttribute('data-open-depth') === '3');
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ type: 'openBack', openDepth: 3 });
  });

  it('selected back type chip has border-blue-500 styling', () => {
    render(<BackPanel value={{ type: 'keyhole', openDepth: 0 }} onChange={vi.fn()} />);
    const keyhole = screen.getAllByRole('button').find((b) => b.getAttribute('data-back-type') === 'keyhole');
    const closed = screen.getAllByRole('button').find((b) => b.getAttribute('data-back-type') === 'closed');
    expect(keyhole?.className).toContain('border-blue-500');
    expect(closed?.className).not.toContain('border-blue-500');
  });

  it('selected depth button has border-blue-500 styling', () => {
    render(<BackPanel value={{ type: 'openBack', openDepth: 3 }} onChange={vi.fn()} />);
    const d3 = screen.getAllByRole('button').find((b) => b.getAttribute('data-open-depth') === '3');
    const d0 = screen.getAllByRole('button').find((b) => b.getAttribute('data-open-depth') === '0');
    expect(d3?.className).toContain('border-blue-500');
    expect(d0?.className).not.toContain('border-blue-500');
  });

  it('Korean labels are displayed for all back types', () => {
    render(<BackPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('막힘')).toBeDefined();
    expect(screen.getByText('V 백')).toBeDefined();
    expect(screen.getByText('일루전 백')).toBeDefined();
    expect(screen.getByText('오픈백')).toBeDefined();
    expect(screen.getByText('키홀')).toBeDefined();
    expect(screen.getByText('단추 줄')).toBeDefined();
    expect(screen.getByText('레이스업 코르셋')).toBeDefined();
    expect(screen.getByText('드레이프')).toBeDefined();
  });

  it('section heading 등판 스타일 is rendered', () => {
    render(<BackPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('등판 스타일')).toBeDefined();
  });

  it('개방 깊이 heading shown only when openBack is selected', () => {
    const { rerender } = render(<BackPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.queryByText('개방 깊이')).toBeNull();
    rerender(<BackPanel value={{ type: 'openBack', openDepth: 0 }} onChange={vi.fn()} />);
    expect(screen.getByText('개방 깊이')).toBeDefined();
  });
});
