import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMeta,
  setMeta,
  clearMeta,
  listEntries,
  getEntry,
  upsertEntry,
  removeEntry,
  clearAll,
} from './db';
import { createDefaultEntry } from '../types';
import type { AppMeta, AnchorSet } from '../types';

const DUMMY_ANCHORS: AnchorSet = {
  headTop: { x: 0, y: 0 },
  chin: { x: 0, y: 0 },
  neckCenter: { x: 0, y: 0 },
  shoulderL: { x: 0, y: 0 },
  shoulderR: { x: 0, y: 0 },
  bust: { x: 0, y: 0 },
  waist: { x: 0, y: 0 },
  hipL: { x: 0, y: 0 },
  hipR: { x: 0, y: 0 },
  kneeL: { x: 0, y: 0 },
  kneeR: { x: 0, y: 0 },
  hemL: { x: 0, y: 0 },
  hemR: { x: 0, y: 0 },
  hemCenter: { x: 0, y: 0 },
};

const DUMMY_META: AppMeta = {
  basePhoto: null,
  poseLandmarks: null,
  createdAt: 1000,
};

beforeEach(async () => {
  await clearAll();
});

describe('meta round-trip', () => {
  it('returns undefined before any setMeta', async () => {
    const result = await getMeta();
    expect(result).toBeUndefined();
  });

  it('stores and retrieves meta', async () => {
    await setMeta(DUMMY_META);
    const result = await getMeta();
    expect(result).toEqual(DUMMY_META);
  });

  it('clearMeta removes the stored value', async () => {
    await setMeta(DUMMY_META);
    await clearMeta();
    const result = await getMeta();
    expect(result).toBeUndefined();
  });
});

describe('entry round-trip', () => {
  it('upserts and retrieves an entry by id', async () => {
    const entry = createDefaultEntry('e1', DUMMY_ANCHORS);
    await upsertEntry(entry);
    const result = await getEntry('e1');
    expect(result).toEqual(entry);
  });

  it('getEntry returns undefined for unknown id', async () => {
    const result = await getEntry('nonexistent');
    expect(result).toBeUndefined();
  });

  it('upsert overwrites existing entry', async () => {
    const entry = createDefaultEntry('e1', DUMMY_ANCHORS);
    await upsertEntry(entry);
    const updated = { ...entry, nickname: 'Updated' };
    await upsertEntry(updated);
    const result = await getEntry('e1');
    expect(result?.nickname).toBe('Updated');
  });
});

describe('listEntries ordering', () => {
  it('returns entries sorted by createdAt descending', async () => {
    const oldest = { ...createDefaultEntry('a', DUMMY_ANCHORS), createdAt: 1000 };
    const middle = { ...createDefaultEntry('b', DUMMY_ANCHORS), createdAt: 2000 };
    const newest = { ...createDefaultEntry('c', DUMMY_ANCHORS), createdAt: 3000 };

    // Insert out of order to verify sorting is by index, not insertion order
    await upsertEntry(middle);
    await upsertEntry(oldest);
    await upsertEntry(newest);

    const entries = await listEntries();
    expect(entries.map((e) => e.id)).toEqual(['c', 'b', 'a']);
  });
});

describe('removeEntry', () => {
  it('removes the specified entry', async () => {
    const entry = createDefaultEntry('e1', DUMMY_ANCHORS);
    await upsertEntry(entry);
    await removeEntry('e1');
    const result = await getEntry('e1');
    expect(result).toBeUndefined();
  });

  it('does not affect other entries when removing one', async () => {
    const e1 = createDefaultEntry('e1', DUMMY_ANCHORS);
    const e2 = createDefaultEntry('e2', DUMMY_ANCHORS);
    await upsertEntry(e1);
    await upsertEntry(e2);
    await removeEntry('e1');
    const remaining = await listEntries();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('e2');
  });
});

describe('clearAll', () => {
  it('clears both meta and entries', async () => {
    await setMeta(DUMMY_META);
    await upsertEntry(createDefaultEntry('e1', DUMMY_ANCHORS));
    await clearAll();
    expect(await getMeta()).toBeUndefined();
    expect(await listEntries()).toHaveLength(0);
  });
});
