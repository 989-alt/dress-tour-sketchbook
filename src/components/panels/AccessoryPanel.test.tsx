import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessoryPanel } from './AccessoryPanel';
import { ACCESSORY_ORDER } from '../../parts/accessories';

describe('AccessoryPanel', () => {
  it('renders 6 chips (one per AccessoryType)', () => {
    const onChange = vi.fn();
    render(<AccessoryPanel value="none" onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(ACCESSORY_ORDER.length);
    expect(buttons).toHaveLength(6);
  });

  it('the active chip matches the current value', () => {
    const onChange = vi.fn();
    render(<AccessoryPanel value="tiara" onChange={onChange} />);
    const active = screen.getByRole('button', { name: /티아라/ });
    expect(active.className).toContain('border-rose-400');
  });

  it('clicking a chip calls onChange with that AccessoryType', () => {
    const onChange = vi.fn();
    render(<AccessoryPanel value="none" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /헤드밴드/ }));
    expect(onChange).toHaveBeenCalledWith('headband');
  });

  it('clicking floralCrown chip calls onChange with floralCrown', () => {
    const onChange = vi.fn();
    render(<AccessoryPanel value="none" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /플로럴/ }));
    expect(onChange).toHaveBeenCalledWith('floralCrown');
  });

  it('each chip has a data-accessory-type attribute', () => {
    const onChange = vi.fn();
    render(<AccessoryPanel value="none" onChange={onChange} />);
    for (const type of ACCESSORY_ORDER) {
      expect(document.querySelector(`[data-accessory-type="${type}"]`)).not.toBeNull();
    }
  });

  it('none chip is active when value is none', () => {
    const onChange = vi.fn();
    render(<AccessoryPanel value="none" onChange={onChange} />);
    const noneBtn = document.querySelector('[data-accessory-type="none"]') as HTMLButtonElement;
    expect(noneBtn.className).toContain('border-rose-400');
  });
});
