import { describe, it, expect } from 'vitest';
import { paramsHash } from './paramsHash';
import { createDefaultEntry } from '../types';
import type { AnchorSet, DressEntry } from '../types';

const DEFAULT_ANCHORS: AnchorSet = {
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

function makeEntry(overrides: Partial<DressEntry> = {}): DressEntry {
  return { ...createDefaultEntry('test-id', DEFAULT_ANCHORS), ...overrides };
}

describe('paramsHash', () => {
  it('is deterministic — same entry returns same hash', () => {
    const entry = makeEntry();
    expect(paramsHash(entry)).toBe(paramsHash(entry));
    // Call twice independently to ensure no internal mutation
    expect(paramsHash(makeEntry())).toBe(paramsHash(makeEntry()));
  });

  it('changes when silhouette changes', () => {
    const a = makeEntry({ silhouette: 'aline' });
    const b = makeEntry({ silhouette: 'mermaid' });
    expect(paramsHash(a)).not.toBe(paramsHash(b));
  });

  it('changes when neckline changes', () => {
    const a = makeEntry({ neckline: 'sweetheart' });
    const b = makeEntry({ neckline: 'keyhole' });
    expect(paramsHash(a)).not.toBe(paramsHash(b));
  });

  it('does NOT change when nickname or shop changes (metadata-only)', () => {
    const base = paramsHash(makeEntry());
    const withNickname = paramsHash(makeEntry({ nickname: 'My Favourite Dress' }));
    const withShop = paramsHash(makeEntry({ shop: 'Bridal Boutique' }));
    expect(withNickname).toBe(base);
    expect(withShop).toBe(base);
  });

  it('does NOT change when anchors change', () => {
    const base = paramsHash(makeEntry());
    const movedAnchor = paramsHash(
      makeEntry({
        anchors: { ...DEFAULT_ANCHORS, bust: { x: 100, y: 200 } },
      }),
    );
    expect(movedAnchor).toBe(base);
  });

  it('changes when referenceDress is added', () => {
    const without = makeEntry({ referenceDress: null });
    const with_ = makeEntry({
      referenceDress: { dataUrl: 'data:image/jpeg;base64,abc123', uploadedAt: 1000 },
    });
    expect(paramsHash(without)).not.toBe(paramsHash(with_));
  });

  it('different insertion orders of embellishments produce same hash (sort-stable)', () => {
    const orderA = makeEntry({
      embellishments: [
        { type: 'beads', region: 'bodice', intensity: 3 },
        { type: 'crystals', region: 'skirt', intensity: 2 },
      ],
    });
    const orderB = makeEntry({
      embellishments: [
        { type: 'crystals', region: 'skirt', intensity: 2 },
        { type: 'beads', region: 'bodice', intensity: 3 },
      ],
    });
    expect(paramsHash(orderA)).toBe(paramsHash(orderB));
  });
});
