import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FabricPanel } from './FabricPanel';
import type { FabricType } from '../../types';

const DEFAULT_VALUE = {
  bodice:  'satin'  as FabricType,
  skirt:   'satin'  as FabricType,
  sleeves: 'satin'  as FabricType,
  veil:    'tulle'  as FabricType,
};

const ALL_FABRICS: FabricType[] = ['satin', 'mikado', 'organza', 'tulle', 'lace', 'chiffon', 'taffeta'];

describe('FabricPanel', () => {
  it('renders 4 region rows', () => {
    render(<FabricPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByText('상의')).toBeDefined();
    expect(screen.getByText('치마')).toBeDefined();
    expect(screen.getByText('소매')).toBeDefined();
    expect(screen.getByText('베일')).toBeDefined();
  });

  it('renders 7 fabric chips per region (4 × 7 = 28 total)', () => {
    render(<FabricPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('button').filter((b) => b.hasAttribute('data-fabric'));
    expect(chips).toHaveLength(28);
  });

  it('all 7 FabricType values are present for the bodice region', () => {
    render(<FabricPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    for (const fabric of ALL_FABRICS) {
      const chips = screen.getAllByRole('button').filter(
        (b) => b.getAttribute('data-region') === 'bodice' && b.getAttribute('data-fabric') === fabric,
      );
      expect(chips).toHaveLength(1);
    }
  });

  it('all 4 regions have chips for each fabric type', () => {
    render(<FabricPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const regions = ['bodice', 'skirt', 'sleeves', 'veil'];
    for (const region of regions) {
      const chips = screen.getAllByRole('button').filter((b) => b.getAttribute('data-region') === region);
      expect(chips).toHaveLength(7);
    }
  });

  it('clicking a bodice fabric chip calls onChange with new bodice value', () => {
    const onChange = vi.fn();
    render(<FabricPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-region') === 'bodice' && b.getAttribute('data-fabric') === 'lace',
    );
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, bodice: 'lace' });
  });

  it('clicking a skirt fabric chip calls onChange with new skirt value', () => {
    const onChange = vi.fn();
    render(<FabricPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-region') === 'skirt' && b.getAttribute('data-fabric') === 'chiffon',
    );
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, skirt: 'chiffon' });
  });

  it('clicking a sleeves fabric chip calls onChange with new sleeves value', () => {
    const onChange = vi.fn();
    render(<FabricPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-region') === 'sleeves' && b.getAttribute('data-fabric') === 'organza',
    );
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, sleeves: 'organza' });
  });

  it('clicking a veil fabric chip calls onChange with new veil value', () => {
    const onChange = vi.fn();
    render(<FabricPanel value={DEFAULT_VALUE} onChange={onChange} />);
    const btn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-region') === 'veil' && b.getAttribute('data-fabric') === 'mikado',
    );
    fireEvent.click(btn!);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_VALUE, veil: 'mikado' });
  });

  it('selected bodice chip has border-rose-400 styling', () => {
    render(<FabricPanel value={{ ...DEFAULT_VALUE, bodice: 'taffeta' }} onChange={vi.fn()} />);
    const selected = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-region') === 'bodice' && b.getAttribute('data-fabric') === 'taffeta',
    );
    const other = screen.getAllByRole('button').find(
      (b) => b.getAttribute('data-region') === 'bodice' && b.getAttribute('data-fabric') === 'satin',
    );
    expect(selected?.className).toContain('border-rose-400');
    expect(other?.className).not.toContain('border-rose-400');
  });

  it('Korean fabric labels are displayed (each appearing 4 times)', () => {
    render(<FabricPanel value={DEFAULT_VALUE} onChange={vi.fn()} />);
    // Each label appears once per region row (4 rows × 1 = 4 times)
    const satinLabels = screen.getAllByText('새틴');
    expect(satinLabels).toHaveLength(4);
    expect(screen.getAllByText('미카도')).toHaveLength(4);
    expect(screen.getAllByText('오간자')).toHaveLength(4);
    expect(screen.getAllByText('튤')).toHaveLength(4);
    expect(screen.getAllByText('레이스')).toHaveLength(4);
    expect(screen.getAllByText('시폰')).toHaveLength(4);
    expect(screen.getAllByText('태피터')).toHaveLength(4);
  });
});
