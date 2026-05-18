import type {
  DressEntry,
  SilhouetteType,
  NecklineType,
  SleeveType,
  SleeveMaterial,
  WaistPosition,
  BodiceStructure,
  WaistAccent,
  BackType,
  SkirtTexture,
  TrainLength,
  FabricType,
  EmbellishmentType,
  Region,
  ColorEnum,
  VeilLength,
  VeilEdge,
  AccessoryType,
} from '../types';

export interface BuildPromptOptions {
  /** Whether a reference dress image is being sent. If true, the prompt
   * instructs the model to use that image as the design starting point. */
  hasReferenceDress: boolean;
  /** If true, the AI is given the PREVIOUS generation result as input. The
   * prompt instructs the model to PRESERVE everything from that previous
   * image and only modify what's specified (regions + extra instructions).
   * Defaults to false. */
  hasPreviousResult?: boolean;
  /** Free-form additional user instructions appended near the end of the prompt. */
  extraInstructions?: string;
  /** Region-specific instructions paired with the pre-drawn mask paths. */
  regionPrompts?: { id: string; prompt: string; pathData: string; hue: number }[];
}

// ── Lookup tables ─────────────────────────────────────────────────────────────

const SILHOUETTE: Record<SilhouetteType, string> = {
  aline: 'classic A-line — fitted bodice from shoulders to natural waist, then progressively flaring outward to a wide hem',
  mermaid: 'mermaid silhouette — fitted from shoulders to knees, then dramatic flare from the knees to the floor',
  trumpet: 'trumpet silhouette — fitted from shoulders to mid-thigh, then gentler flare to the floor',
  princess: 'princess silhouette — fitted bodice with continuous gentle flare from natural waist to a wide hem',
  sheath: 'sheath / column silhouette — narrow straight column from shoulders to floor, fitted throughout',
  empire: 'empire waist silhouette — fitted bust, high waist right under the bust, then flowing skirt',
  fitFlare: 'fit-and-flare silhouette — fitted bodice through natural waist, then gentle flare',
  tealength: 'tea-length silhouette — A-line shape ending at mid-calf',
  mini: 'mini-length silhouette — A-line or sheath shape ending above the knee',
};

const NECKLINE: Record<NecklineType, string> = {
  sweetheart: 'sweetheart neckline (heart-shaped bust top)',
  vRegular: 'V-neckline at moderate depth',
  vDeep: 'deep V-neckline reaching the bust',
  vPlunging: 'plunging V-neckline reaching below the bust',
  halter: 'halter neckline (straps tied behind the neck, bare shoulders)',
  offShoulder: 'off-shoulder neckline (sitting just below the shoulders)',
  oneShoulder: 'one-shoulder asymmetric neckline',
  strapless: 'strapless straight neckline across the bust',
  boat: 'boat / bateau neckline (wide horizontal across the collarbone)',
  illusionCrew: 'illusion crew neckline (sheer fabric to the throat, beaded details)',
  square: 'square neckline',
  scoop: 'rounded scoop neckline',
  portrait: 'portrait neckline (wide curved across the shoulders, framing collarbone)',
  highNeck: 'high-neck collar reaching the throat',
  keyhole: 'keyhole neckline (slot opening at the center of the chest)',
};

const SLEEVE: Record<SleeveType, string> = {
  sleeveless: 'sleeveless',
  cap: 'cap sleeves covering only the shoulder caps',
  short: 'short sleeves to mid-bicep',
  threeQuarter: 'three-quarter sleeves to the elbow',
  long: 'long fitted sleeves to the wrists',
  bishop: 'bishop sleeves (gathered at the wrist into a wide cuff)',
  puff: 'puff sleeves (dramatic gathered shoulders)',
  bell: 'bell sleeves (flaring outward at the wrist)',
  legOfMutton: 'leg-of-mutton sleeves (heavily puffed shoulders, fitted from elbow down)',
  illusion: 'illusion long sleeves in sheer fabric',
};

const SLEEVE_MATERIAL: Record<SleeveMaterial, string> = {
  opaque: 'opaque',
  sheer: 'sheer tulle',
  lace: 'lace overlay',
  beaded: 'beaded',
};

const WAIST_POSITION: Record<WaistPosition, string> = {
  natural: 'natural waist',
  empire: 'empire waist (just under the bust)',
  basque: 'basque waist (V-shaped, dipping below natural waist)',
  drop: 'dropped waist (lowered, hipline level)',
  asymmetric: 'asymmetric waist',
};

const BODICE_STRUCTURE: Record<BodiceStructure, string> = {
  corset: 'corset bodice with vertical boning',
  softFit: 'softly fitted bodice',
  peplum: 'peplum bodice with a flared waist piece',
  mockPeplum: 'mock peplum (a thin horizontal band) at the waist',
};

const WAIST_ACCENT: Record<WaistAccent, string | null> = {
  none: null,
  sash: 'a satin sash tied at the waist',
  ribbon: 'a ribbon bow at the waist',
  brooch: 'a decorative brooch at the waist center',
  beadedBand: 'a beaded waist band',
};

const BACK: Record<BackType, (openDepth: number) => string> = {
  closed: () => 'closed back',
  vBack: () => 'V-back',
  illusionBack: () => 'illusion back in sheer fabric',
  openBack: (d) => `open back at depth ${d}/5`,
  keyhole: () => 'keyhole back opening',
  buttonRow: () => 'a row of decorative buttons down the back',
  laceUpCorset: () => 'lace-up corset back',
  drape: () => 'draped back fabric',
};

const SKIRT_TEXTURE: Record<SkirtTexture, (layers: number) => string> = {
  smooth: () => 'smooth skirt',
  gathered: () => 'gathered skirt with soft pleating at the waist',
  pleated: () => 'pleated skirt',
  tiered: (n) => `${n}-tier tiered skirt`,
  layeredTulle: () => 'layered tulle skirt',
  ruffled: () => 'ruffled skirt',
  ruched: () => 'ruched skirt with diagonal gathers',
  asymmetricDrape: () => 'asymmetric draped skirt',
};

const TRAIN: Record<TrainLength, string> = {
  none: 'no train',
  sweep: 'sweep train (just touching the floor)',
  court: 'court train (~1 m extending behind)',
  chapel: 'chapel train (~1.5 m extending behind)',
  cathedral: 'cathedral train (very long, ~2+ m flowing behind)',
};

const FABRIC: Record<FabricType, string> = {
  satin: 'silk satin',
  mikado: 'mikado silk (structured matte)',
  organza: 'crisp organza',
  tulle: 'soft tulle',
  lace: 'lace',
  chiffon: 'flowing chiffon',
  taffeta: 'taffeta (slightly stiff with subtle sheen)',
};

const COLOR: Record<ColorEnum, string> = {
  pureWhite: 'pure white',
  offWhite: 'off-white',
  ivory: 'ivory',
  champagne: 'champagne',
  blush: 'blush pink',
  gold: 'gold',
  grey: 'soft grey',
  blue: 'pale ice blue',
  black: 'black',
};

const EMBELLISHMENT_TYPE: Record<EmbellishmentType, string> = {
  beads: 'beadwork',
  laceApplique: 'lace appliqués',
  threeDFlorals: '3D floral appliqués',
  crystals: 'crystals',
  pearls: 'pearl beading',
  embroidery: 'embroidery',
  sequins: 'sequins',
  ribbons: 'ribbon details',
  decorativeButtons: 'decorative buttons',
};

const EMBELLISHMENT_REGION: Record<Region, string> = {
  bodice: 'on the bodice',
  waist: 'around the waist',
  skirt: 'on the skirt',
  sleeves: 'on the sleeves',
  train: 'on the train',
  allover: 'allover',
};

const INTENSITY: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'subtle',
  2: 'light',
  3: 'moderate',
  4: 'heavy',
  5: 'dense, statement-level',
};

const VEIL_LENGTH: Record<VeilLength, string | null> = {
  none: null,
  blusher: 'short blusher veil over the face',
  elbow: 'elbow-length veil',
  fingertip: 'fingertip-length veil',
  waltz: 'waltz-length veil at mid-calf',
  chapel: 'chapel-length veil reaching the floor',
  cathedral: 'cathedral-length veil flowing well behind',
};

const VEIL_EDGE: Record<VeilEdge, string> = {
  cut: ' with plain cut edge',
  ribbon: ' trimmed with ribbon',
  beaded: ' trimmed with beading',
  lace: ' trimmed with lace',
};

const ACCESSORY: Record<AccessoryType, string | null> = {
  none: null,
  tiara: 'a tiara on the head',
  headband: 'a decorative headband',
  hairVine: 'a delicate hair vine',
  hairComb: 'a decorative hair comb on one side',
  floralCrown: 'a floral crown',
};

// ── Main builder ──────────────────────────────────────────────────────────────

export function buildPrompt(entry: DressEntry, options: BuildPromptOptions): string {
  const { hasReferenceDress, hasPreviousResult = false, extraInstructions, regionPrompts } = options;

  const lines: string[] = [];

  if (hasPreviousResult) {
    // ── Iteration mode opening ──
    lines.push('You are iterating on a wedding dress synthesis.');
    lines.push('');
    lines.push('INPUT IMAGES (in order):');
    lines.push('1. The bride\'s photo (face masked) — face/mask/pose/background must all be preserved exactly.');
    lines.push('2. The PREVIOUS synthesis result of the dress on this bride. Treat this as the canonical current dress.');
    if (hasReferenceDress) {
      lines.push('3. Dress design reference for any new design elements.');
    }
    lines.push('');
    lines.push('CRITICAL ITERATION RULES:');
    lines.push('- Use the PREVIOUS RESULT (image 2) as the source of truth for the existing dress.');
    lines.push('- Preserve EVERY existing dress detail (silhouette, neckline, fabric, color, embellishments, veil, accessory) EXCEPT what\'s specifically changed below.');
    lines.push('- Only modify the areas / aspects explicitly listed under MODIFICATIONS or REGION-SPECIFIC INSTRUCTIONS.');
    lines.push('- The result should look like the previous image with only the requested changes applied — not a fresh re-synthesis.');
    lines.push('');
    lines.push('MODIFICATIONS (apply on top of the previous result):');
    if (extraInstructions && extraInstructions.trim().length > 0) {
      lines.push(extraInstructions.trim());
    } else {
      lines.push('(none — preserve everything as-is unless region instructions specify otherwise)');
    }
    lines.push('');
  } else {
    // ── Fresh synthesis opening ──
    lines.push('You are applying a wedding dress to the person in the FIRST input image.');
    lines.push('');

    if (hasReferenceDress) {
      lines.push(
        'Use the SECOND input image as the dress design reference. Adapt that dress\'s overall look to fit the person in the first image, while modifying it per the specification below.',
      );
    } else {
      lines.push(
        'Synthesize a wedding dress that fits the person in the input image per the specification below.',
      );
    }

    lines.push('');
  }

  // ── Critical constraints ──
  lines.push('CRITICAL CONSTRAINTS:');
  lines.push('- Preserve the person\'s face exactly, including any masked, blurred, or pixelated regions on the face. Do not regenerate or alter masked regions.');
  lines.push('- Preserve the person\'s pose, body proportions, skin tone, hair, hands.');
  lines.push('- Preserve the original background entirely.');
  lines.push('- Match the original photo\'s lighting direction, color temperature, and ambient mood.');
  lines.push('');

  // ── Dress spec ──
  // When iterating, the spec is reference only — the previous result is the source of truth.
  if (hasPreviousResult) {
    lines.push('For reference, the current dress specification is:');
  } else {
    lines.push('WEDDING DRESS SPECIFICATION:');
  }

  // Silhouette
  lines.push(`- Silhouette: ${SILHOUETTE[entry.silhouette]}`);

  // Neckline
  lines.push(`- Neckline: ${NECKLINE[entry.neckline]}`);

  // Sleeves
  const sleeveType = entry.sleeve.type;
  const sleeveMat = entry.sleeve.material;
  const sleeveMatPhrase = SLEEVE_MATERIAL[sleeveMat];
  const sleevePhrase = SLEEVE[sleeveType];
  const sleeveFabric = FABRIC[entry.fabric.sleeves];
  lines.push(`- Sleeves: ${sleevePhrase} in ${sleeveMatPhrase}, ${sleeveFabric} fabric`);

  // Bodice
  const waistPos = WAIST_POSITION[entry.bodice.waistPosition];
  const structure = BODICE_STRUCTURE[entry.bodice.structure];
  const accentPhrase = WAIST_ACCENT[entry.bodice.accent];
  let bodiceStr = `- Bodice: ${waistPos}, ${structure} construction`;
  if (accentPhrase !== null) {
    bodiceStr += `, with ${accentPhrase} in ${COLOR[entry.bodice.accentColor]}`;
  }
  lines.push(bodiceStr);

  // Back
  const backPhrase = BACK[entry.back.type](entry.back.openDepth);
  lines.push(`- Back: ${backPhrase}`);

  // Skirt
  const skirtPhrase = SKIRT_TEXTURE[entry.skirt.texture](entry.skirt.layers);
  let skirtStr = `- Skirt: ${skirtPhrase}`;
  const slit = entry.skirt.slit;
  if (slit.type !== 'none' && slit.height > 0) {
    skirtStr += `, with a ${slit.type} thigh slit at level ${slit.height}/5`;
  }
  const trainPhrase = TRAIN[entry.skirt.train];
  skirtStr += `, ${trainPhrase}`;
  lines.push(skirtStr);

  // Fabric
  const bodFabric = FABRIC[entry.fabric.bodice];
  const skirtFabric = FABRIC[entry.fabric.skirt];
  lines.push(`- Fabric: ${bodFabric} bodice and ${skirtFabric} skirt`);

  // Color
  const primaryColor = COLOR[entry.color.primary];
  let colorStr = `- Color: ${primaryColor}`;
  if (entry.color.gradient === 'ombre' && entry.color.secondary) {
    colorStr += `, transitioning to ${COLOR[entry.color.secondary]} as ombre gradient`;
  }
  if (entry.color.accent !== entry.color.primary) {
    colorStr += `, ${COLOR[entry.color.accent]} accents on waist/embellishments`;
  }
  lines.push(colorStr);

  // Embellishments
  const activeEmbellishments = entry.embellishments.filter((e) => e.intensity > 0);
  if (activeEmbellishments.length > 0) {
    const embPhrases = activeEmbellishments.map((e) => {
      const typeName = EMBELLISHMENT_TYPE[e.type];
      const regionName = EMBELLISHMENT_REGION[e.region];
      const intensityName = INTENSITY[e.intensity as 1 | 2 | 3 | 4 | 5];
      return `${intensityName} ${typeName} ${regionName}`;
    });
    lines.push(`- Embellishments: ${embPhrases.join(', ')}`);
  }

  // Veil
  if (entry.veil !== null && VEIL_LENGTH[entry.veil.length] !== null) {
    let veilStr = VEIL_LENGTH[entry.veil.length] as string;
    veilStr += VEIL_EDGE[entry.veil.edge];
    if (entry.veil.layers === 2) {
      veilStr += ', with two layers (blusher in front + main veil behind)';
    }
    lines.push(`- Veil: ${veilStr}`);
  }

  // Hair accessory
  const accessoryPhrase = ACCESSORY[entry.accessory];
  if (accessoryPhrase !== null) {
    lines.push(`- Hair accessory: ${accessoryPhrase}`);
  }

  lines.push('');

  // ── Extra instructions (fresh mode only — iteration mode embeds them above) ──
  if (!hasPreviousResult && extraInstructions && extraInstructions.trim().length > 0) {
    lines.push('ADDITIONAL USER NOTES:');
    lines.push(extraInstructions.trim());
    lines.push('');
  }

  // ── Region-specific instructions ──
  const activeRegions = regionPrompts?.filter((r) => r.prompt.trim().length > 0) ?? [];
  if (activeRegions.length > 0) {
    lines.push('REGION-SPECIFIC INSTRUCTIONS:');
    if (hasPreviousResult) {
      lines.push('These changes apply ON TOP of the previous result. Only the brushed areas are affected.');
    } else {
      lines.push('The user has marked specific areas on the bride photo with colored paint strokes (see metadata below). Each region has its own instruction. Apply each instruction ONLY to the area covered by its corresponding stroke pattern.');
    }
    lines.push('');
    activeRegions.forEach((r, i) => {
      lines.push(`- Region ${i + 1} (hue ${r.hue}°, path: ${r.pathData.slice(0, 80)}${r.pathData.length > 80 ? '…' : ''} — focus on the brushed area): ${r.prompt}`);
    });
    lines.push('');
  }

  // ── Result requirements ──
  lines.push('RESULT REQUIREMENTS:');
  lines.push('- Photorealistic, professional bridal photography quality.');
  lines.push('- Sharp focus on dress detail and texture.');
  lines.push('- Resolution matching the input photo.');
  lines.push('- Output as image only — no text overlay, no watermark, no border.');

  return lines.join('\n');
}
