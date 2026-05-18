import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NecklinePanel } from './NecklinePanel';

describe('NecklinePanel', () => {
  it('renders 15 neckline chips', () => {
    render(<NecklinePanel value="sweetheart" onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button');
    expect(chips).toHaveLength(15);
  });

  it('all 15 NecklineType values are represented', () => {
    render(<NecklinePanel value="sweetheart" onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button');
    const types = chips.map((c) => c.getAttribute('data-neckline'));
    const expected = [
      'sweetheart', 'vRegular', 'vDeep', 'vPlunging', 'halter',
      'offShoulder', 'oneShoulder', 'strapless', 'boat', 'illusionCrew',
      'square', 'scoop', 'portrait', 'highNeck', 'keyhole',
    ];
    for (const t of expected) {
      expect(types).toContain(t);
    }
  });

  it('clicking a chip calls onChange with the correct type', () => {
    const onChange = vi.fn();
    render(<NecklinePanel value="sweetheart" onChange={onChange} />);
    const chips = screen.getAllByRole('button');
    const scoop = chips.find((c) => c.getAttribute('data-neckline') === 'scoop');
    expect(scoop).toBeDefined();
    fireEvent.click(scoop!);
    expect(onChange).toHaveBeenCalledWith('scoop');
  });

  it('selected chip has border-rose-400 styling', () => {
    render(<NecklinePanel value="square" onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button');
    const squareChip = chips.find((c) => c.getAttribute('data-neckline') === 'square');
    const boatChip = chips.find((c) => c.getAttribute('data-neckline') === 'boat');
    expect(squareChip?.className).toContain('border-rose-400');
    expect(boatChip?.className).not.toContain('border-rose-400');
  });

  it('re-render changes selected chip styling', () => {
    const { rerender } = render(<NecklinePanel value="sweetheart" onChange={vi.fn()} />);
    const getChip = (type: string) =>
      screen.getAllByRole('button').find((c) => c.getAttribute('data-neckline') === type);
    expect(getChip('sweetheart')?.className).toContain('border-rose-400');
    expect(getChip('highNeck')?.className).not.toContain('border-rose-400');
    rerender(<NecklinePanel value="highNeck" onChange={vi.fn()} />);
    expect(getChip('sweetheart')?.className).not.toContain('border-rose-400');
    expect(getChip('highNeck')?.className).toContain('border-rose-400');
  });
});
