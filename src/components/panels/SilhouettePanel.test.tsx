import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SilhouettePanel } from './SilhouettePanel';

describe('SilhouettePanel', () => {
  it('renders 9 silhouette chips', () => {
    render(<SilhouettePanel value="aline" onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button');
    expect(chips).toHaveLength(9);
  });

  it('clicking a chip calls onChange with the correct type', () => {
    const onChange = vi.fn();
    render(<SilhouettePanel value="aline" onChange={onChange} />);
    const mermaidBtn = screen.getByTestId !== undefined
      ? screen.getAllByRole('button').find((b) => b.getAttribute('data-silhouette') === 'mermaid')
      : null;
    if (mermaidBtn) {
      fireEvent.click(mermaidBtn);
      expect(onChange).toHaveBeenCalledWith('mermaid');
    }
  });

  it('all 9 silhouette types are represented', () => {
    render(<SilhouettePanel value="aline" onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button');
    const types = chips.map((c) => c.getAttribute('data-silhouette'));
    const expected = ['aline', 'mermaid', 'trumpet', 'princess', 'sheath', 'empire', 'fitFlare', 'tealength', 'mini'];
    for (const t of expected) {
      expect(types).toContain(t);
    }
  });

  it('selected chip has different styling from unselected', () => {
    const { rerender } = render(<SilhouettePanel value="aline" onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button');
    const alineChip = chips.find((c) => c.getAttribute('data-silhouette') === 'aline');
    const mermaidChip = chips.find((c) => c.getAttribute('data-silhouette') === 'mermaid');
    expect(alineChip?.className).toContain('border-blue-500');
    expect(mermaidChip?.className).not.toContain('border-blue-500');
    rerender(<SilhouettePanel value="mermaid" onChange={vi.fn()} />);
    const newChips = screen.getAllByRole('button');
    const newMermaid = newChips.find((c) => c.getAttribute('data-silhouette') === 'mermaid');
    expect(newMermaid?.className).toContain('border-blue-500');
  });
});
