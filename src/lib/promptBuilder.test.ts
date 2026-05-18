import { describe, it, expect } from 'vitest';
import { buildPrompt } from './promptBuilder';
import { createDefaultEntry } from '../types';
import type { DressEntry } from '../types';

const DEFAULT_ANCHORS = {
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

describe('buildPrompt', () => {
  it('default entry contains A-line, sweetheart, natural waist, pure white, silk satin', () => {
    const prompt = buildPrompt(makeEntry(), { hasReferenceDress: false });
    expect(prompt).toContain('A-line');
    expect(prompt).toContain('sweetheart');
    expect(prompt).toContain('natural waist');
    expect(prompt).toContain('pure white');
    expect(prompt).toContain('silk satin');
  });

  it('default entry contains "no train"', () => {
    const prompt = buildPrompt(makeEntry(), { hasReferenceDress: false });
    expect(prompt).toContain('no train');
  });

  it('mermaid + lace neckline + cathedral train all appear', () => {
    const entry = makeEntry({
      silhouette: 'mermaid',
      neckline: 'keyhole',
      skirt: {
        texture: 'smooth',
        layers: 3,
        slit: { type: 'none', height: 0 },
        train: 'cathedral',
      },
    });
    const prompt = buildPrompt(entry, { hasReferenceDress: false });
    expect(prompt).toContain('mermaid');
    expect(prompt).toContain('keyhole');
    expect(prompt).toContain('cathedral');
  });

  it('empire waist mentions "just under the bust"', () => {
    const entry = makeEntry({
      bodice: {
        waistPosition: 'empire',
        structure: 'softFit',
        accent: 'none',
        accentColor: 'pureWhite',
      },
    });
    const prompt = buildPrompt(entry, { hasReferenceDress: false });
    expect(prompt).toContain('just under the bust');
  });

  it('embellishments at intensity 3 render as "moderate beadwork on the bodice"', () => {
    const entry = makeEntry({
      embellishments: [{ type: 'beads', region: 'bodice', intensity: 3 }],
    });
    const prompt = buildPrompt(entry, { hasReferenceDress: false });
    expect(prompt).toContain('moderate beadwork on the bodice');
  });

  it('embellishment at intensity 0 is excluded from prompt', () => {
    const entry = makeEntry({
      embellishments: [{ type: 'crystals', region: 'skirt', intensity: 0 }],
    });
    const prompt = buildPrompt(entry, { hasReferenceDress: false });
    expect(prompt).not.toContain('crystals');
    expect(prompt).not.toContain('Embellishments');
  });

  it('null veil produces no veil section', () => {
    const entry = makeEntry({ veil: null });
    const prompt = buildPrompt(entry, { hasReferenceDress: false });
    expect(prompt).not.toContain('- Veil:');
  });

  it('fingertip veil with lace edge mentions "fingertip" and "lace"', () => {
    const entry = makeEntry({
      veil: { length: 'fingertip', edge: 'lace', layers: 1 },
    });
    const prompt = buildPrompt(entry, { hasReferenceDress: false });
    expect(prompt).toContain('fingertip');
    expect(prompt).toContain('lace');
  });

  it('veil with 2 layers mentions "two layers" and "blusher"', () => {
    const entry = makeEntry({
      veil: { length: 'cathedral', edge: 'cut', layers: 2 },
    });
    const prompt = buildPrompt(entry, { hasReferenceDress: false });
    expect(prompt).toContain('two layers');
    expect(prompt).toContain('blusher');
  });

  it('hasReferenceDress true mentions "SECOND input image"', () => {
    const prompt = buildPrompt(makeEntry(), { hasReferenceDress: true });
    expect(prompt).toContain('SECOND input image');
  });

  it('hasReferenceDress false does not mention "second image" or "SECOND"', () => {
    const prompt = buildPrompt(makeEntry(), { hasReferenceDress: false });
    expect(prompt.toLowerCase()).not.toContain('second');
  });

  it('extraInstructions appears under ADDITIONAL USER NOTES', () => {
    const prompt = buildPrompt(makeEntry(), {
      hasReferenceDress: false,
      extraInstructions: 'Make the bodice extra sparkly.',
    });
    expect(prompt).toContain('ADDITIONAL USER NOTES:');
    expect(prompt).toContain('Make the bodice extra sparkly.');
  });

  it('accessory "none" produces no Hair accessory line', () => {
    const entry = makeEntry({ accessory: 'none' });
    const prompt = buildPrompt(entry, { hasReferenceDress: false });
    expect(prompt).not.toContain('Hair accessory');
  });

  it('accessory "tiara" produces "tiara" in prompt', () => {
    const entry = makeEntry({ accessory: 'tiara' });
    const prompt = buildPrompt(entry, { hasReferenceDress: false });
    expect(prompt).toContain('tiara');
  });
});
