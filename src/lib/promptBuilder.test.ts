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

describe('buildPrompt — hasPreviousResult', () => {
  it('hasPreviousResult true: prompt contains "PREVIOUS synthesis result" and "Preserve EVERY existing"', () => {
    const prompt = buildPrompt(makeEntry(), { hasReferenceDress: false, hasPreviousResult: true });
    expect(prompt).toContain('PREVIOUS synthesis result');
    expect(prompt).toContain('Preserve EVERY existing');
  });

  it('hasPreviousResult true: spec section is softened (no "WEDDING DRESS SPECIFICATION" header)', () => {
    const prompt = buildPrompt(makeEntry(), { hasReferenceDress: false, hasPreviousResult: true });
    expect(prompt).not.toContain('WEDDING DRESS SPECIFICATION');
    expect(prompt).toContain('For reference, the current dress specification is');
  });

  it('hasPreviousResult false: original "WEDDING DRESS SPECIFICATION" wording present', () => {
    const prompt = buildPrompt(makeEntry(), { hasReferenceDress: false, hasPreviousResult: false });
    expect(prompt).toContain('WEDDING DRESS SPECIFICATION');
    expect(prompt).not.toContain('For reference, the current dress specification is');
  });

  it('hasPreviousResult true with extraInstructions: instructions appear under MODIFICATIONS', () => {
    const prompt = buildPrompt(makeEntry(), {
      hasReferenceDress: false,
      hasPreviousResult: true,
      extraInstructions: '소매를 짧게 해주세요',
    });
    expect(prompt).toContain('MODIFICATIONS');
    expect(prompt).toContain('소매를 짧게 해주세요');
  });

  it('hasReferenceDress + hasPreviousResult both true: prompt mentions all 3 input images', () => {
    const prompt = buildPrompt(makeEntry(), { hasReferenceDress: true, hasPreviousResult: true });
    expect(prompt).toContain('1. The bride');
    expect(prompt).toContain('2. The PREVIOUS synthesis result');
    expect(prompt).toContain('3. Dress design reference');
  });
});

describe('buildPrompt — regionPrompts', () => {
  it('regionPrompts present: prompt mentions "REGION-SPECIFIC INSTRUCTIONS"', () => {
    const prompt = buildPrompt(makeEntry(), {
      hasReferenceDress: false,
      hasPreviousResult: false,
      regionPrompts: [{ id: 'r1', prompt: '여기에 레이스 추가', pathData: 'M 10 20 L 30 40', hue: 120 }],
    });
    expect(prompt).toContain('REGION-SPECIFIC INSTRUCTIONS');
  });

  it('regionPrompts with 2 regions: both listed numbered', () => {
    const prompt = buildPrompt(makeEntry(), {
      hasReferenceDress: false,
      hasPreviousResult: false,
      regionPrompts: [
        { id: 'r1', prompt: '레이스 추가', pathData: 'M 10 20 L 30 40', hue: 120 },
        { id: 'r2', prompt: '비즈 더 많이', pathData: 'M 50 60 L 70 80', hue: 200 },
      ],
    });
    expect(prompt).toContain('Region 1');
    expect(prompt).toContain('Region 2');
    expect(prompt).toContain('레이스 추가');
    expect(prompt).toContain('비즈 더 많이');
  });

  it('regionPrompts empty array: no region section in prompt', () => {
    const prompt = buildPrompt(makeEntry(), {
      hasReferenceDress: false,
      hasPreviousResult: false,
      regionPrompts: [],
    });
    expect(prompt).not.toContain('REGION-SPECIFIC INSTRUCTIONS');
  });

  it('regionPrompts with blank prompt entries are filtered out', () => {
    const prompt = buildPrompt(makeEntry(), {
      hasReferenceDress: false,
      hasPreviousResult: false,
      regionPrompts: [{ id: 'r1', prompt: '   ', pathData: 'M 10 20 L 30 40', hue: 0 }],
    });
    expect(prompt).not.toContain('REGION-SPECIFIC INSTRUCTIONS');
  });

  it('regionPrompts + hasPreviousResult: states changes apply on top of previous result', () => {
    const prompt = buildPrompt(makeEntry(), {
      hasReferenceDress: false,
      hasPreviousResult: true,
      regionPrompts: [{ id: 'r1', prompt: '레이스 추가', pathData: 'M 10 20', hue: 60 }],
    });
    expect(prompt).toContain('REGION-SPECIFIC INSTRUCTIONS');
    expect(prompt).toContain('apply ON TOP of the previous result');
  });
});
