import { describe, it, expect } from 'vitest';
import {
  SILHOUETTE_GLOSSARY,
  NECKLINE_GLOSSARY,
  SLEEVE_GLOSSARY,
  SLEEVE_MATERIAL_GLOSSARY,
  WAIST_POSITION_GLOSSARY,
  BODICE_STRUCTURE_GLOSSARY,
  WAIST_ACCENT_GLOSSARY,
  BACK_GLOSSARY,
  SKIRT_TEXTURE_GLOSSARY,
  TRAIN_GLOSSARY,
  FABRIC_GLOSSARY,
  EMBELLISHMENT_GLOSSARY,
  VEIL_LENGTH_GLOSSARY,
  VEIL_EDGE_GLOSSARY,
  ACCESSORY_GLOSSARY,
} from './glossary';

// All enum values from types.ts — checked manually against types.ts
const SILHOUETTE_TYPES = ['aline', 'mermaid', 'trumpet', 'princess', 'sheath', 'empire', 'fitFlare', 'tealength', 'mini'] as const;
const NECKLINE_TYPES = ['sweetheart', 'vRegular', 'vDeep', 'vPlunging', 'halter', 'offShoulder', 'oneShoulder', 'strapless', 'boat', 'illusionCrew', 'square', 'scoop', 'portrait', 'highNeck', 'keyhole'] as const;
const SLEEVE_TYPES = ['sleeveless', 'cap', 'short', 'threeQuarter', 'long', 'bishop', 'puff', 'bell', 'legOfMutton', 'illusion'] as const;
const SLEEVE_MATERIALS = ['opaque', 'sheer', 'lace', 'beaded'] as const;
const WAIST_POSITIONS = ['natural', 'empire', 'basque', 'drop', 'asymmetric'] as const;
const BODICE_STRUCTURES = ['corset', 'softFit', 'peplum', 'mockPeplum'] as const;
const WAIST_ACCENTS = ['none', 'sash', 'ribbon', 'brooch', 'beadedBand'] as const;
const BACK_TYPES = ['closed', 'vBack', 'illusionBack', 'openBack', 'keyhole', 'buttonRow', 'laceUpCorset', 'drape'] as const;
const SKIRT_TEXTURES = ['smooth', 'gathered', 'pleated', 'tiered', 'layeredTulle', 'ruffled', 'ruched', 'asymmetricDrape'] as const;
const TRAIN_LENGTHS = ['none', 'sweep', 'court', 'chapel', 'cathedral'] as const;
const FABRIC_TYPES = ['satin', 'mikado', 'organza', 'tulle', 'lace', 'chiffon', 'taffeta'] as const;
const EMBELLISHMENT_TYPES = ['beads', 'laceApplique', 'threeDFlorals', 'crystals', 'pearls', 'embroidery', 'sequins', 'ribbons', 'decorativeButtons'] as const;
const VEIL_LENGTHS = ['none', 'blusher', 'elbow', 'fingertip', 'waltz', 'chapel', 'cathedral'] as const;
const VEIL_EDGES = ['cut', 'ribbon', 'beaded', 'lace'] as const;
const ACCESSORY_TYPES = ['none', 'tiara', 'headband', 'hairVine', 'hairComb', 'floralCrown'] as const;

function allPresent<T extends string>(glossary: Record<T, string>, keys: readonly T[], name: string) {
  describe(name, () => {
    it(`has ${keys.length} entries`, () => {
      expect(Object.keys(glossary)).toHaveLength(keys.length);
    });

    for (const key of keys) {
      it(`has non-empty entry for "${key}"`, () => {
        expect(glossary[key]).toBeTruthy();
        expect(typeof glossary[key]).toBe('string');
        expect(glossary[key].length).toBeGreaterThan(5);
      });
    }
  });
}

allPresent(SILHOUETTE_GLOSSARY, SILHOUETTE_TYPES, 'SILHOUETTE_GLOSSARY');
allPresent(NECKLINE_GLOSSARY, NECKLINE_TYPES, 'NECKLINE_GLOSSARY');
allPresent(SLEEVE_GLOSSARY, SLEEVE_TYPES, 'SLEEVE_GLOSSARY');
allPresent(SLEEVE_MATERIAL_GLOSSARY, SLEEVE_MATERIALS, 'SLEEVE_MATERIAL_GLOSSARY');
allPresent(WAIST_POSITION_GLOSSARY, WAIST_POSITIONS, 'WAIST_POSITION_GLOSSARY');
allPresent(BODICE_STRUCTURE_GLOSSARY, BODICE_STRUCTURES, 'BODICE_STRUCTURE_GLOSSARY');
allPresent(WAIST_ACCENT_GLOSSARY, WAIST_ACCENTS, 'WAIST_ACCENT_GLOSSARY');
allPresent(BACK_GLOSSARY, BACK_TYPES, 'BACK_GLOSSARY');
allPresent(SKIRT_TEXTURE_GLOSSARY, SKIRT_TEXTURES, 'SKIRT_TEXTURE_GLOSSARY');
allPresent(TRAIN_GLOSSARY, TRAIN_LENGTHS, 'TRAIN_GLOSSARY');
allPresent(FABRIC_GLOSSARY, FABRIC_TYPES, 'FABRIC_GLOSSARY');
allPresent(EMBELLISHMENT_GLOSSARY, EMBELLISHMENT_TYPES, 'EMBELLISHMENT_GLOSSARY');
allPresent(VEIL_LENGTH_GLOSSARY, VEIL_LENGTHS, 'VEIL_LENGTH_GLOSSARY');
allPresent(VEIL_EDGE_GLOSSARY, VEIL_EDGES, 'VEIL_EDGE_GLOSSARY');
allPresent(ACCESSORY_GLOSSARY, ACCESSORY_TYPES, 'ACCESSORY_GLOSSARY');
