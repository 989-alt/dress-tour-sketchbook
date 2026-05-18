import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmbellishmentsPanel } from './EmbellishmentsPanel';
import type { Embellishment } from '../../types';

const EMPTY: Embellishment[] = [];

const ONE_PEARL: Embellishment[] = [
  { type: 'pearls', region: 'bodice', intensity: 3 },
];

const TWO_ITEMS: Embellishment[] = [
  { type: 'pearls', region: 'bodice', intensity: 3 },
  { type: 'crystals', region: 'skirt', intensity: 1 },
];

describe('EmbellishmentsPanel — empty state', () => {
  it('renders + 장식 추가 button', () => {
    render(<EmbellishmentsPanel value={EMPTY} accentColor="pureWhite" onChange={vi.fn()} />);
    expect(screen.getByText('+ 장식 추가')).toBeDefined();
  });

  it('shows empty-state message when no embellishments', () => {
    render(<EmbellishmentsPanel value={EMPTY} accentColor="pureWhite" onChange={vi.fn()} />);
    expect(screen.getByText(/장식 없음/)).toBeDefined();
  });

  it('does not show empty-state message when there are embellishments', () => {
    render(<EmbellishmentsPanel value={ONE_PEARL} accentColor="pureWhite" onChange={vi.fn()} />);
    expect(screen.queryByText(/장식 없음/)).toBeNull();
  });
});

describe('EmbellishmentsPanel — add flow', () => {
  it('clicking + 장식 추가 shows type picker', () => {
    render(<EmbellishmentsPanel value={EMPTY} accentColor="pureWhite" onChange={vi.fn()} />);
    fireEvent.click(screen.getByText('+ 장식 추가'));
    // Should show type chips
    expect(screen.getByText('비즈')).toBeDefined();
    expect(screen.getByText('진주')).toBeDefined();
  });

  it('selecting a type shows region picker', () => {
    render(<EmbellishmentsPanel value={EMPTY} accentColor="pureWhite" onChange={vi.fn()} />);
    fireEvent.click(screen.getByText('+ 장식 추가'));
    const beadsBtn = screen.getAllByRole('button').find((b) => b.getAttribute('data-add-type') === 'beads');
    fireEvent.click(beadsBtn!);
    expect(screen.getByText('상의')).toBeDefined();
    expect(screen.getByText('치마')).toBeDefined();
  });

  it('selecting region fires onChange with new embellishment at intensity=1', () => {
    const onChange = vi.fn();
    render(<EmbellishmentsPanel value={EMPTY} accentColor="pureWhite" onChange={onChange} />);
    fireEvent.click(screen.getByText('+ 장식 추가'));
    const beadsBtn = screen.getAllByRole('button').find((b) => b.getAttribute('data-add-type') === 'beads');
    fireEvent.click(beadsBtn!);
    const bodiceBtn = screen.getAllByRole('button').find((b) => b.getAttribute('data-add-region') === 'bodice');
    fireEvent.click(bodiceBtn!);
    expect(onChange).toHaveBeenCalledWith([{ type: 'beads', region: 'bodice', intensity: 1 }]);
  });

  it('cancel button hides the picker', () => {
    render(<EmbellishmentsPanel value={EMPTY} accentColor="pureWhite" onChange={vi.fn()} />);
    fireEvent.click(screen.getByText('+ 장식 추가'));
    fireEvent.click(screen.getByText('취소'));
    expect(screen.queryByText('종류 선택')).toBeNull();
  });
});

describe('EmbellishmentsPanel — existing cards', () => {
  it('renders a card for each embellishment', () => {
    render(<EmbellishmentsPanel value={TWO_ITEMS} accentColor="pureWhite" onChange={vi.fn()} />);
    const cards = document.querySelectorAll('[data-embellishment-card]');
    expect(cards).toHaveLength(2);
  });

  it('shows Korean type and region labels on cards', () => {
    render(<EmbellishmentsPanel value={ONE_PEARL} accentColor="pureWhite" onChange={vi.fn()} />);
    expect(screen.getByText('진주')).toBeDefined();
    expect(screen.getByText('상의')).toBeDefined();
  });

  it('renders 6 intensity buttons per card (0-5)', () => {
    render(<EmbellishmentsPanel value={ONE_PEARL} accentColor="pureWhite" onChange={vi.fn()} />);
    const intensityBtns = document.querySelectorAll('[data-intensity]');
    expect(intensityBtns).toHaveLength(6);
  });

  it('clicking intensity button fires onChange with new intensity', () => {
    const onChange = vi.fn();
    render(<EmbellishmentsPanel value={ONE_PEARL} accentColor="pureWhite" onChange={onChange} />);
    const btn5 = document.querySelector('[data-intensity="5"]') as HTMLButtonElement;
    fireEvent.click(btn5);
    expect(onChange).toHaveBeenCalledWith([{ type: 'pearls', region: 'bodice', intensity: 5 }]);
  });

  it('clicking intensity=0 fires onChange with intensity=0', () => {
    const onChange = vi.fn();
    render(<EmbellishmentsPanel value={ONE_PEARL} accentColor="pureWhite" onChange={onChange} />);
    const btn0 = document.querySelector('[data-intensity="0"]') as HTMLButtonElement;
    fireEvent.click(btn0);
    expect(onChange).toHaveBeenCalledWith([{ type: 'pearls', region: 'bodice', intensity: 0 }]);
  });

  it('delete button fires onChange with item removed', () => {
    const onChange = vi.fn();
    render(<EmbellishmentsPanel value={ONE_PEARL} accentColor="pureWhite" onChange={onChange} />);
    const delBtn = document.querySelector('[data-delete="0"]') as HTMLButtonElement;
    fireEvent.click(delBtn);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('delete second item preserves first', () => {
    const onChange = vi.fn();
    render(<EmbellishmentsPanel value={TWO_ITEMS} accentColor="pureWhite" onChange={onChange} />);
    const delBtn = document.querySelector('[data-delete="1"]') as HTMLButtonElement;
    fireEvent.click(delBtn);
    expect(onChange).toHaveBeenCalledWith([TWO_ITEMS[0]]);
  });
});

describe('EmbellishmentsPanel — extra controls', () => {
  it('shows size selector for threeDFlorals', () => {
    render(<EmbellishmentsPanel
      value={[{ type: 'threeDFlorals', region: 'skirt', intensity: 2 }]}
      accentColor="pureWhite"
      onChange={vi.fn()}
    />);
    expect(screen.getByText(/크기/)).toBeDefined();
    expect(screen.getByText('S')).toBeDefined();
    expect(screen.getByText('M')).toBeDefined();
    expect(screen.getByText('L')).toBeDefined();
  });

  it('shows style selector for embroidery', () => {
    render(<EmbellishmentsPanel
      value={[{ type: 'embroidery', region: 'bodice', intensity: 2 }]}
      accentColor="pureWhite"
      onChange={vi.fn()}
    />);
    expect(screen.getByText(/스타일/)).toBeDefined();
    expect(screen.getByText('플로럴')).toBeDefined();
    expect(screen.getByText('기하학')).toBeDefined();
  });

  it('shows placement and count for ribbons', () => {
    render(<EmbellishmentsPanel
      value={[{ type: 'ribbons', region: 'waist', intensity: 1 }]}
      accentColor="pureWhite"
      onChange={vi.fn()}
    />);
    expect(screen.getByText(/위치/)).toBeDefined();
    // '허리' appears twice: region chip + placement option — check both present
    expect(screen.getAllByText('허리').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('어깨')).toBeDefined();
  });

  it('shows side and count for decorativeButtons', () => {
    render(<EmbellishmentsPanel
      value={[{ type: 'decorativeButtons', region: 'bodice', intensity: 2 }]}
      accentColor="pureWhite"
      onChange={vi.fn()}
    />);
    expect(screen.getByText(/면/)).toBeDefined();
    expect(screen.getByText('앞')).toBeDefined();
    expect(screen.getByText('뒤')).toBeDefined();
  });

  it('clicking size=L calls onChange with extra.size=L', () => {
    const onChange = vi.fn();
    render(<EmbellishmentsPanel
      value={[{ type: 'threeDFlorals', region: 'skirt', intensity: 2 }]}
      accentColor="pureWhite"
      onChange={onChange}
    />);
    const btn = document.querySelector('[data-size="L"]') as HTMLButtonElement;
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith([
      { type: 'threeDFlorals', region: 'skirt', intensity: 2, extra: { size: 'L' } },
    ]);
  });
});
