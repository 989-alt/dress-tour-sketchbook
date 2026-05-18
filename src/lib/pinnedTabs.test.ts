import { describe, it, expect, beforeEach } from 'vitest';
import { getPinnedTabs, togglePinnedTab } from './pinnedTabs';

const KEY = 'pinned-tabs';

beforeEach(() => {
  localStorage.clear();
});

describe('getPinnedTabs', () => {
  it('returns empty array when nothing is stored', () => {
    expect(getPinnedTabs()).toEqual([]);
  });

  it('returns stored tabs', () => {
    localStorage.setItem(KEY, JSON.stringify(['basic', 'fabric']));
    expect(getPinnedTabs()).toEqual(['basic', 'fabric']);
  });

  it('returns empty array on corrupted storage', () => {
    localStorage.setItem(KEY, 'invalid json{{{');
    expect(getPinnedTabs()).toEqual([]);
  });

  it('filters out non-string values', () => {
    localStorage.setItem(KEY, JSON.stringify(['basic', 42, null, 'fabric']));
    expect(getPinnedTabs()).toEqual(['basic', 'fabric']);
  });
});

describe('togglePinnedTab', () => {
  it('pins a tab that is not pinned', () => {
    togglePinnedTab('basic');
    expect(getPinnedTabs()).toContain('basic');
  });

  it('unpins a tab that is already pinned', () => {
    togglePinnedTab('basic');
    togglePinnedTab('basic');
    expect(getPinnedTabs()).not.toContain('basic');
  });

  it('pins multiple tabs independently', () => {
    togglePinnedTab('basic');
    togglePinnedTab('fabric');
    expect(getPinnedTabs()).toContain('basic');
    expect(getPinnedTabs()).toContain('fabric');
  });

  it('persists across calls (simulating page reload)', () => {
    togglePinnedTab('meta');
    // Re-read from localStorage directly
    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored).toContain('meta');
  });
});
