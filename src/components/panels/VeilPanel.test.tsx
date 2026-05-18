import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { VeilPanel } from './VeilPanel';
import type { VeilLength, VeilEdge } from '../../types';

describe('VeilPanel', () => {
  it('renders all 7 length chips', () => {
    const { container } = render(<VeilPanel value={null} onChange={() => {}} />);
    const lengths: VeilLength[] = ['none', 'blusher', 'elbow', 'fingertip', 'waltz', 'chapel', 'cathedral'];
    for (const l of lengths) {
      expect(container.querySelector(`[data-veil-length="${l}"]`)).toBeTruthy();
    }
  });

  it('selecting none passes null to onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <VeilPanel value={{ length: 'elbow', edge: 'cut', layers: 1 }} onChange={onChange} />,
    );
    fireEvent.click(container.querySelector('[data-veil-length="none"]')!);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('selecting a length when value is null creates new value', () => {
    const onChange = vi.fn();
    const { container } = render(<VeilPanel value={null} onChange={onChange} />);
    fireEvent.click(container.querySelector('[data-veil-length="fingertip"]')!);
    expect(onChange).toHaveBeenCalledWith({ length: 'fingertip', edge: 'cut', layers: 1 });
  });

  it('selecting a length when value exists updates length only', () => {
    const onChange = vi.fn();
    const { container } = render(
      <VeilPanel value={{ length: 'elbow', edge: 'ribbon', layers: 2 }} onChange={onChange} />,
    );
    fireEvent.click(container.querySelector('[data-veil-length="waltz"]')!);
    expect(onChange).toHaveBeenCalledWith({ length: 'waltz', edge: 'ribbon', layers: 2 });
  });

  it('does not show edge/layers when value is null', () => {
    const { container } = render(<VeilPanel value={null} onChange={() => {}} />);
    expect(container.querySelector('[data-veil-edge]')).toBeNull();
    expect(container.querySelector('[data-veil-layers]')).toBeNull();
  });

  it('shows 4 edge chips when veil is active', () => {
    const { container } = render(
      <VeilPanel value={{ length: 'chapel', edge: 'cut', layers: 1 }} onChange={() => {}} />,
    );
    const edges: VeilEdge[] = ['cut', 'ribbon', 'beaded', 'lace'];
    for (const e of edges) {
      expect(container.querySelector(`[data-veil-edge="${e}"]`)).toBeTruthy();
    }
  });

  it('clicking an edge chip updates edge', () => {
    const onChange = vi.fn();
    const { container } = render(
      <VeilPanel value={{ length: 'chapel', edge: 'cut', layers: 1 }} onChange={onChange} />,
    );
    fireEvent.click(container.querySelector('[data-veil-edge="lace"]')!);
    expect(onChange).toHaveBeenCalledWith({ length: 'chapel', edge: 'lace', layers: 1 });
  });

  it('shows layer toggle when veil is active', () => {
    const { container } = render(
      <VeilPanel value={{ length: 'elbow', edge: 'cut', layers: 1 }} onChange={() => {}} />,
    );
    expect(container.querySelector('[data-veil-layers="1"]')).toBeTruthy();
    expect(container.querySelector('[data-veil-layers="2"]')).toBeTruthy();
  });

  it('clicking layers=2 updates layers', () => {
    const onChange = vi.fn();
    const { container } = render(
      <VeilPanel value={{ length: 'elbow', edge: 'cut', layers: 1 }} onChange={onChange} />,
    );
    fireEvent.click(container.querySelector('[data-veil-layers="2"]')!);
    expect(onChange).toHaveBeenCalledWith({ length: 'elbow', edge: 'cut', layers: 2 });
  });

  it('clicking layers=1 updates layers', () => {
    const onChange = vi.fn();
    const { container } = render(
      <VeilPanel value={{ length: 'cathedral', edge: 'beaded', layers: 2 }} onChange={onChange} />,
    );
    fireEvent.click(container.querySelector('[data-veil-layers="1"]')!);
    expect(onChange).toHaveBeenCalledWith({ length: 'cathedral', edge: 'beaded', layers: 1 });
  });

  it('length chip is visually active for current value', () => {
    const { container } = render(
      <VeilPanel value={{ length: 'waltz', edge: 'cut', layers: 1 }} onChange={() => {}} />,
    );
    const waltzBtn = container.querySelector('[data-veil-length="waltz"]')!;
    expect(waltzBtn.className).toContain('border-blue-500');
  });
});
