import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetadataPanel } from './MetadataPanel';
import type { DressEntry } from '../../types';

type MetaFields = Pick<DressEntry, 'categorical' | 'quotes' | 'ratings' | 'pros' | 'cons'>;

const DEFAULT_ENTRY: MetaFields = {
  categorical: {
    necklineNotes: [],
    sleeveNotes: [],
    backNotes: [],
    fabricNotes: [],
    trainNotes: [],
  },
  quotes: { bride: '', groom: '' },
  ratings: { firstImpression: 3, fit: 3, comfort: 3, weddingFeel: 3 },
  pros: [],
  cons: [],
};

describe('MetadataPanel', () => {
  it('renders all five categorical sections', () => {
    render(<MetadataPanel entry={DEFAULT_ENTRY} onChange={vi.fn()} />);
    expect(screen.getByText('네크라인')).toBeInTheDocument();
    expect(screen.getByText('소매')).toBeInTheDocument();
    expect(screen.getByText('등')).toBeInTheDocument();
    expect(screen.getByText('소재')).toBeInTheDocument();
    expect(screen.getByText('트레인')).toBeInTheDocument();
  });

  it('renders bride and groom quote textareas', () => {
    render(<MetadataPanel entry={DEFAULT_ENTRY} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('신부 소감')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('신랑 소감')).toBeInTheDocument();
  });

  it('renders all four rating labels', () => {
    render(<MetadataPanel entry={DEFAULT_ENTRY} onChange={vi.fn()} />);
    expect(screen.getByText('첫인상')).toBeInTheDocument();
    expect(screen.getByText('피팅')).toBeInTheDocument();
    expect(screen.getByText('편안함')).toBeInTheDocument();
    expect(screen.getByText('웨딩 느낌')).toBeInTheDocument();
  });

  it('renders pros section with 3 inputs', () => {
    render(<MetadataPanel entry={DEFAULT_ENTRY} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('장점 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('장점 2')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('장점 3')).toBeInTheDocument();
  });

  it('renders cons section with 3 inputs', () => {
    render(<MetadataPanel entry={DEFAULT_ENTRY} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('단점 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('단점 2')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('단점 3')).toBeInTheDocument();
  });

  it('clicking a checkbox calls onChange with updated categorical', () => {
    const onChange = vi.fn();
    render(<MetadataPanel entry={DEFAULT_ENTRY} onChange={onChange} />);
    // '깊다' is the first neckline option
    const checkbox = screen.getByLabelText('깊다') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        categorical: expect.objectContaining({ necklineNotes: ['깊다'] }),
      }),
    );
  });

  it('clicking a rating star calls onChange with updated ratings', () => {
    const onChange = vi.fn();
    render(<MetadataPanel entry={DEFAULT_ENTRY} onChange={onChange} />);
    const star5 = screen.getByLabelText('첫인상 5점');
    fireEvent.click(star5);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ratings: expect.objectContaining({ firstImpression: 5 }),
      }),
    );
  });
});
