#!/usr/bin/env tsx
import { writeFile, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Set GEMINI_API_KEY env var.');
  process.exit(1);
}
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3-pro-image-preview';
const FORCE = process.argv.includes('--force');

interface Task {
  category: string;
  value: string;
  prompt: string;
}

// ── Prompt builders ───────────────────────────────────────────────────────────

function silhouettePrompt(v: string): string {
  const map: Record<string, string> = {
    aline: 'classic A-line silhouette: fitted bodice flaring out smoothly to a wide hem',
    mermaid: 'mermaid silhouette: fitted from shoulders to knees, dramatic flare from knees to floor',
    trumpet: 'trumpet silhouette: fitted from shoulders to mid-thigh, gradual flare',
    princess: 'princess silhouette: fitted bodice with continuous gentle flare from waist',
    sheath: 'sheath/column silhouette: narrow straight column, fitted throughout',
    empire: 'empire silhouette: fitted bust, high waist seam right under the bust, flowing skirt',
    fitFlare: 'fit-and-flare silhouette: fitted through natural waist, then gentle flare',
    tealength: 'tea-length silhouette: A-line ending at mid-calf',
    mini: 'mini-length silhouette: short A-line ending above the knee',
  };
  return `Fashion-catalog full-body render of a wedding dress on a faceless mannequin (no head visible). Show ONLY the dress with ${map[v]}. Plain white background. Ivory satin fabric, no embellishments, no veil, no model face or skin. Front view, sharp focus, soft studio lighting. The silhouette must be unambiguous.`;
}

function necklinePrompt(v: string): string {
  const map: Record<string, string> = {
    sweetheart: 'sweetheart neckline — heart-shaped bust top',
    vRegular: 'V-neckline at moderate depth',
    vDeep: 'deep V-neckline reaching the bust',
    vPlunging: 'very deep plunging V-neckline reaching below the bust',
    halter: 'halter neckline — straps tied behind the neck, bare shoulders',
    offShoulder: 'off-shoulder neckline sitting just below the shoulders',
    oneShoulder: 'one-shoulder asymmetric neckline',
    strapless: 'strapless straight neckline across the bust',
    boat: 'boat/bateau neckline — wide horizontal across the collarbone',
    illusionCrew: 'illusion crew neckline — sheer fabric to the throat with beaded details',
    square: 'square neckline',
    scoop: 'rounded scoop neckline',
    portrait: 'portrait neckline — wide curved across the shoulders framing collarbone',
    highNeck: 'high-neck collar reaching the throat',
    keyhole: 'keyhole neckline — slot opening at the center of the chest',
  };
  return `Macro CLOSE-UP shot of a wedding dress NECKLINE only — ${map[v]}. Camera tightly framed on the chest and neck area of a mannequin. Show shoulder-to-bust area only. NO face, NO skirt, NO full body. Plain white background. Ivory satin fabric. Studio lighting. The neckline shape must be unmistakable.`;
}

function sleevePrompt(v: string): string {
  const map: Record<string, string> = {
    sleeveless: 'sleeveless — bare arm and shoulder, no sleeve fabric',
    cap: 'cap sleeve — small fabric covering only the shoulder cap',
    short: 'short sleeve to mid-bicep',
    threeQuarter: 'three-quarter sleeve to the elbow',
    long: 'long fitted sleeve to the wrist',
    bishop: 'bishop sleeve — long, gathered at the wrist into a wide cuff',
    puff: 'puff sleeve — short with dramatic gathered shoulder',
    bell: 'bell sleeve — long, flaring outward at the wrist',
    legOfMutton: 'leg-of-mutton sleeve — heavily puffed shoulder, fitted from elbow to wrist',
    illusion: 'illusion long sleeve in sheer fabric',
  };
  return `Close-up of ONE sleeve of a wedding dress: ${map[v]}. Frame from the shoulder/upper bodice down through the sleeve to the wrist. Show ONE sleeve only (left side preferred). NO face, NO skirt, NO full body. Plain white background. Ivory satin (unless the sleeve is sheer/lace). Studio lighting. The sleeve shape must be unmistakable.`;
}

function sleeveMaterialPrompt(v: string): string {
  const map: Record<string, string> = {
    opaque: 'smooth opaque ivory silk satin',
    sheer: 'sheer transparent ivory tulle, very fine mesh',
    lace: 'intricate ivory lace pattern, floral motif',
    beaded: 'densely beaded ivory fabric with pearls and crystals',
  };
  return `Macro fabric swatch close-up: ${map[v]}. Top-down view, fabric fills the frame as a 1:1 square. Plain background. Sharp focus, studio lighting. The fabric texture and material must be unmistakably visible.`;
}

function waistPositionPrompt(v: string): string {
  const map: Record<string, string> = {
    natural: 'natural waist (at the narrowest part of the torso)',
    empire: 'empire waist (right under the bust line, high)',
    basque: 'basque waist (V-shaped, dipping below the natural waist)',
    drop: 'dropped waist (at the hip line, lowered)',
    asymmetric: 'asymmetric waist seam',
  };
  return `Close-up of a wedding dress focused on the WAIST SEAM POSITION — ${map[v]}. Frame from bust to upper hip on a faceless mannequin. NO face, NO full skirt below the waist. Ivory satin, plain white background. Studio lighting. The waist seam line must be clearly visible.`;
}

function bodiceStructurePrompt(v: string): string {
  const map: Record<string, string> = {
    corset: 'corseted bodice with vertical boning lines visible',
    softFit: 'softly fitted bodice with smooth seamless surface',
    peplum: 'peplum bodice — short flared piece extending below the waist seam',
    mockPeplum: 'mock peplum — thin horizontal band at the waist (no flare)',
  };
  return `Close-up of a wedding dress BODICE: ${map[v]}. Frame from bust to lower hip on a faceless mannequin. NO face. Ivory satin, plain white background. Studio lighting.`;
}

function waistAccentPrompt(v: string): string {
  const map: Record<string, string> = {
    sash: 'satin ribbon sash tied at the waist with a soft bow',
    ribbon: 'large decorative ribbon bow at the waist center',
    brooch: 'jeweled brooch ornament at the waist center',
    beadedBand: 'a beaded belt band wrapping the waist',
  };
  return `Close-up of the WAIST area of a wedding dress with a ${map[v]} accent. Frame tightly around the waist (bust to hip max). NO face. Ivory satin, plain white background. Studio lighting. The waist accent must be unmistakable.`;
}

function backPrompt(v: string): string {
  const map: Record<string, string> = {
    closed: 'fully closed back',
    vBack: 'V-shaped back opening',
    illusionBack: 'illusion back — sheer fabric covering an open back',
    openBack: 'open back with deep scooping',
    keyhole: 'keyhole back — small teardrop opening',
    buttonRow: 'a row of decorative covered buttons down the center back',
    laceUpCorset: 'lace-up corset back with crisscross ribbon',
    drape: 'softly draped back fabric',
  };
  return `Back-view close-up of a wedding dress: ${map[v]}. Frame from shoulders to lower back on a faceless mannequin (back of head visible only if needed). NO front, NO full skirt. Ivory satin, plain white background. Studio lighting. The back style must be unmistakable.`;
}

function skirtTexturePrompt(v: string): string {
  const map: Record<string, string> = {
    smooth: 'smooth flat skirt surface',
    gathered: 'gathered skirt with soft pleats radiating from the waist',
    pleated: 'crisp vertical pleated skirt',
    tiered: 'three-tier skirt with horizontal layer seams',
    layeredTulle: 'multiple layers of fluffy tulle skirt',
    ruffled: 'ruffled skirt with cascading ruffles',
    ruched: 'ruched skirt with diagonal gathered detailing',
    asymmetricDrape: 'asymmetrically draped skirt',
  };
  return `Close-up of a wedding dress SKIRT showing ${map[v]}. Frame from upper thigh to mid-shin (waist NOT visible). Ivory satin/tulle/etc as appropriate. Plain white background. Studio lighting. The skirt texture must be unmistakable.`;
}

function slitPrompt(v: string): string {
  const map: Record<string, string> = {
    side: 'a thigh-high side slit on the right leg of the skirt',
    front: 'a center front thigh-high slit',
  };
  return `Close-up of a wedding dress skirt showing ${map[v]}. Frame the lower body — hip to mid-thigh visible. Mannequin's leg slightly visible through the slit. Ivory satin, plain white background. Studio lighting. The slit must be clear.`;
}

function trainPrompt(v: string): string {
  const map: Record<string, string> = {
    sweep: 'a very short sweep train (about 15 cm extending behind)',
    court: 'a court train (about 1 m extending behind)',
    chapel: 'a chapel train (about 1.5 m extending behind)',
    cathedral: 'a very long cathedral train (2+ m extending behind, dramatic)',
  };
  return `Rear floor-level view of a wedding dress showing ${map[v]}. Camera angle: behind and slightly above, showing the dress hem and how the train extends along the floor. Faceless mannequin from the back, ankle to floor area. Ivory satin, plain white floor and background. Studio lighting. The train length must be clear by comparison to the figure.`;
}

function fabricPrompt(v: string): string {
  const map: Record<string, string> = {
    satin: 'smooth glossy silk satin',
    mikado: 'mikado silk — heavyweight, structured, matte with subtle natural sheen, holds dramatic shape (NOT shiny)',
    organza: 'silk organza — crisp, sheer, lightly stiff with a translucent crystalline quality, faint glassy sheen at edges',
    tulle: 'soft fine bridal tulle — fine mesh, slightly fuzzy, ethereal',
    lace: 'detailed ivory bridal lace — intricate floral motifs, scalloped edges, semi-sheer cordage and small embroidered florals',
    chiffon: 'silk chiffon — flowing, lightweight, slight crinkle texture, soft matte drape',
    taffeta: 'silk taffeta — slightly stiff with subtle paper-like rustle, muted satin sheen',
    chunkyBeading: 'heavy bridal couture beading — fabric densely encrusted with large crystals, baroque pearls, and dimensional rhinestones; chunky 3D sparkle covers the surface; refractive, luminous, statement-piece',
    delicateBeading: 'all-over fine beading — tiny seed beads, small pearls, and micro crystals in delicate scattered patterns; subtle continuous shimmer; refined rather than flashy',
  };
  return `Macro fabric SWATCH close-up of ${map[v]} in ivory color. Square format (1:1). Fabric fills the frame. Top-down view. Plain background. Sharp focus, studio lighting. The fabric character must be unmistakable from texture alone.`;
}

function colorPrompt(v: string): string {
  const map: Record<string, string> = {
    pureWhite: 'pure bright white',
    offWhite: 'off-white (slightly warm white)',
    ivory: 'ivory cream',
    champagne: 'champagne beige-gold',
    blush: 'soft blush pink',
    gold: 'rose gold',
    grey: 'soft pewter grey',
    blue: 'pale ice blue',
    black: 'deep black',
  };
  return `Fabric swatch in ${map[v]} color, smooth satin texture. Square format (1:1), fabric fills the frame. Top-down view, plain background, studio lighting. The exact color tone must be clearly visible. Just the color — no embellishments.`;
}

function embellishmentPrompt(v: string): string {
  const map: Record<string, string> = {
    beads: 'tiny glass beads densely scattered on ivory fabric',
    laceApplique: 'a single floral lace appliqué patch on ivory fabric',
    threeDFlorals: '3D fabric flowers with multiple petals layered on ivory fabric',
    crystals: 'sparkling crystal stones in various sizes scattered on ivory fabric',
    pearls: 'rows of pearl beading on ivory fabric',
    embroidery: 'delicate floral white-on-white embroidery on ivory fabric',
    sequins: 'small flat sequins densely covering ivory fabric',
    ribbons: 'satin ribbon trim curling on ivory fabric',
    decorativeButtons: 'a vertical row of small fabric-covered buttons on ivory satin',
  };
  return `Macro extreme close-up of ${map[v]} embellishment. Square format. Fabric fills the frame. Top-down view, sharp focus on the embellishment texture, studio lighting. Plain white background.`;
}

function veilLengthPrompt(v: string): string {
  const map: Record<string, string> = {
    blusher: 'a short blusher veil covering just the face/upper chest',
    elbow: 'an elbow-length veil reaching the elbow',
    fingertip: 'a fingertip-length veil reaching the fingertips when arms hang down',
    waltz: 'a waltz-length veil at mid-calf',
    chapel: 'a chapel-length veil reaching the floor',
    cathedral: 'a cathedral-length veil flowing well behind on the floor',
  };
  return `Profile-view illustration of a faceless bridal mannequin (back of head only, NO face) wearing ${map[v]}. The veil hangs from the back of the head. Frame the whole figure if needed to show how far the veil falls. Ivory tulle veil, plain white wedding dress, plain white background. Studio lighting. The veil length must be clear by comparison to the body.`;
}

function veilEdgePrompt(v: string): string {
  const map: Record<string, string> = {
    cut: 'plain cleanly cut edge with no trim',
    ribbon: 'satin ribbon trim along the edge',
    beaded: 'sparkling beading trim along the edge',
    lace: 'detailed lace trim along the edge',
  };
  return `Macro close-up of a wedding veil EDGE showing ${map[v]}. The edge of soft tulle veil fabric occupies the frame. Square format. Plain background, studio lighting. The edge style must be unmistakable.`;
}

function accessoryPrompt(v: string): string {
  const map: Record<string, string> = {
    tiara: 'a crystal tiara worn on top of the head',
    headband: 'a decorative headband across the top of the head',
    hairVine: 'a delicate floral hair vine threaded through the hair',
    hairComb: 'a decorative jeweled comb tucked into the side of the hair',
    floralCrown: 'a fresh-flower crown wreath worn on top of the head',
  };
  return `Top-down close-up of a faceless bridal head (back/top of head, NO face) wearing ${map[v]}. Frame the head and the accessory. Smooth bridal hair (updo or down) visible. Plain background, studio lighting. The accessory shape must be unmistakable.`;
}

// ── Task list (~113 entries) ──────────────────────────────────────────────────

const tasks: Task[] = [
  ...(['aline', 'mermaid', 'trumpet', 'princess', 'sheath', 'empire', 'fitFlare', 'tealength', 'mini'] as const)
    .map((v): Task => ({ category: 'silhouette', value: v, prompt: silhouettePrompt(v) })),

  ...(['sweetheart', 'vRegular', 'vDeep', 'vPlunging', 'halter', 'offShoulder', 'oneShoulder', 'strapless', 'boat', 'illusionCrew', 'square', 'scoop', 'portrait', 'highNeck', 'keyhole'] as const)
    .map((v): Task => ({ category: 'neckline', value: v, prompt: necklinePrompt(v) })),

  ...(['sleeveless', 'cap', 'short', 'threeQuarter', 'long', 'bishop', 'puff', 'bell', 'legOfMutton', 'illusion'] as const)
    .map((v): Task => ({ category: 'sleeve', value: v, prompt: sleevePrompt(v) })),

  ...(['opaque', 'sheer', 'lace', 'beaded'] as const)
    .map((v): Task => ({ category: 'sleeveMaterial', value: v, prompt: sleeveMaterialPrompt(v) })),

  ...(['natural', 'empire', 'basque', 'drop', 'asymmetric'] as const)
    .map((v): Task => ({ category: 'waistPosition', value: v, prompt: waistPositionPrompt(v) })),

  ...(['corset', 'softFit', 'peplum', 'mockPeplum'] as const)
    .map((v): Task => ({ category: 'bodiceStructure', value: v, prompt: bodiceStructurePrompt(v) })),

  ...(['sash', 'ribbon', 'brooch', 'beadedBand'] as const)
    .map((v): Task => ({ category: 'waistAccent', value: v, prompt: waistAccentPrompt(v) })),

  ...(['closed', 'vBack', 'illusionBack', 'openBack', 'keyhole', 'buttonRow', 'laceUpCorset', 'drape'] as const)
    .map((v): Task => ({ category: 'back', value: v, prompt: backPrompt(v) })),

  ...(['smooth', 'gathered', 'pleated', 'tiered', 'layeredTulle', 'ruffled', 'ruched', 'asymmetricDrape'] as const)
    .map((v): Task => ({ category: 'skirtTexture', value: v, prompt: skirtTexturePrompt(v) })),

  ...(['side', 'front'] as const)
    .map((v): Task => ({ category: 'slit', value: v, prompt: slitPrompt(v) })),

  ...(['sweep', 'court', 'chapel', 'cathedral'] as const)
    .map((v): Task => ({ category: 'train', value: v, prompt: trainPrompt(v) })),

  ...(['satin', 'mikado', 'organza', 'tulle', 'lace', 'chiffon', 'taffeta', 'chunkyBeading', 'delicateBeading'] as const)
    .map((v): Task => ({ category: 'fabric', value: v, prompt: fabricPrompt(v) })),

  ...(['pureWhite', 'offWhite', 'ivory', 'champagne', 'blush', 'gold', 'grey', 'blue', 'black'] as const)
    .map((v): Task => ({ category: 'color', value: v, prompt: colorPrompt(v) })),

  ...(['beads', 'laceApplique', 'threeDFlorals', 'crystals', 'pearls', 'embroidery', 'sequins', 'ribbons', 'decorativeButtons'] as const)
    .map((v): Task => ({ category: 'embellishment', value: v, prompt: embellishmentPrompt(v) })),

  ...(['blusher', 'elbow', 'fingertip', 'waltz', 'chapel', 'cathedral'] as const)
    .map((v): Task => ({ category: 'veilLength', value: v, prompt: veilLengthPrompt(v) })),

  ...(['cut', 'ribbon', 'beaded', 'lace'] as const)
    .map((v): Task => ({ category: 'veilEdge', value: v, prompt: veilEdgePrompt(v) })),

  ...(['tiara', 'headband', 'hairVine', 'hairComb', 'floralCrown'] as const)
    .map((v): Task => ({ category: 'accessory', value: v, prompt: accessoryPrompt(v) })),
];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fileExists(p: string): Promise<boolean> {
  try { await access(p); return true; } catch { return false; }
}

interface GeminiInlineData {
  data: string;
  mime_type?: string;
  mimeType?: string;
}

interface GeminiPart {
  inline_data?: GeminiInlineData;
  inlineData?: GeminiInlineData;
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

async function generateOne(prompt: string): Promise<{ data: Buffer; mime: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const j = (await res.json()) as GeminiResponse;
  for (const c of j.candidates ?? []) {
    for (const p of c.content?.parts ?? []) {
      const inline = p.inline_data ?? p.inlineData;
      const mime: string | undefined = inline?.mime_type ?? inline?.mimeType;
      if (inline?.data && typeof mime === 'string' && mime.startsWith('image/')) {
        return { data: Buffer.from(inline.data, 'base64'), mime };
      }
    }
  }
  throw new Error('No image in response');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  let ok = 0, skip = 0, fail = 0;
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const out = join('public/previews', t.category, `${t.value}.png`);
    const tag = `[${i + 1}/${tasks.length}] ${t.category}/${t.value}`;
    if (!FORCE && await fileExists(out)) {
      console.log(`${tag}: skip (exists)`);
      skip++;
      continue;
    }
    try {
      const { data, mime } = await generateOne(t.prompt);
      await mkdir(dirname(out), { recursive: true });
      const pngBuffer = mime === 'image/png' ? data : await sharp(data).png().toBuffer();
      await writeFile(out, pngBuffer);
      console.log(`${tag}: ✓ (${pngBuffer.length} bytes)`);
      ok++;
      await new Promise((r) => setTimeout(r, 400));
    } catch (e) {
      console.error(`${tag}: ✗ ${e instanceof Error ? e.message : e}`);
      fail++;
    }
  }
  console.log(`\nDone. ok=${ok} skip=${skip} fail=${fail}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
