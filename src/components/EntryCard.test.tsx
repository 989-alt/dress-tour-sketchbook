import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EntryCard } from './EntryCard';
import { createDefaultEntry } from '../types';
import { defaultAnchors } from '../lib/defaultAnchors';

beforeAll(() => {
  if (!globalThis.URL.createObjectURL) {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:fake-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  }
});

function makeEntry() {
  const anchors = defaultAnchors(120, 240);
  return createDefaultEntry('test-id', anchors);
}

describe('EntryCard', () => {
  it('renders nickname when provided', () => {
    const entry = { ...makeEntry(), nickname: '마이 드레스' };
    render(<EntryCard entry={entry} />);
    expect(screen.getByText('마이 드레스')).toBeInTheDocument();
  });

  it('renders "이름 없음" when nickname is empty', () => {
    const entry = { ...makeEntry(), nickname: '' };
    render(<EntryCard entry={entry} />);
    expect(screen.getByText('이름 없음')).toBeInTheDocument();
  });

  it('renders the star sum (default is 3+3+3+3=12)', () => {
    const entry = makeEntry();
    render(<EntryCard entry={entry} />);
    expect(screen.getByText('⭐ 12')).toBeInTheDocument();
  });

  it('renders shop name when present', () => {
    const entry = { ...makeEntry(), shop: '웨딩홀' };
    render(<EntryCard entry={entry} />);
    expect(screen.getByText('웨딩홀')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    const entry = makeEntry();
    render(<EntryCard entry={entry} onClick={onClick} />);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders custom star sum', () => {
    const entry = {
      ...makeEntry(),
      ratings: { firstImpression: 5, fit: 4, comfort: 3, weddingFeel: 5 } as const,
    };
    render(<EntryCard entry={entry} />);
    expect(screen.getByText('⭐ 17')).toBeInTheDocument();
  });
});
