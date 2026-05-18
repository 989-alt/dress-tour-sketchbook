export type SilhouetteType =
  | 'aline'
  | 'mermaid'
  | 'trumpet'
  | 'princess'
  | 'sheath'
  | 'empire'
  | 'fitFlare'
  | 'tealength'
  | 'mini';

export type NecklineType =
  | 'sweetheart'
  | 'vRegular'
  | 'vDeep'
  | 'vPlunging'
  | 'halter'
  | 'offShoulder'
  | 'oneShoulder'
  | 'strapless'
  | 'boat'
  | 'illusionCrew'
  | 'square'
  | 'scoop'
  | 'portrait'
  | 'highNeck'
  | 'keyhole';

export type SleeveType =
  | 'sleeveless'
  | 'cap'
  | 'short'
  | 'threeQuarter'
  | 'long'
  | 'bishop'
  | 'puff'
  | 'bell'
  | 'legOfMutton'
  | 'illusion';
export type SleeveMaterial = 'opaque' | 'sheer' | 'lace' | 'beaded';

export type WaistPosition = 'natural' | 'empire' | 'basque' | 'drop' | 'asymmetric';
export type BodiceStructure = 'corset' | 'softFit' | 'peplum' | 'mockPeplum';
export type WaistAccent = 'none' | 'sash' | 'ribbon' | 'brooch' | 'beadedBand';

export type BackType =
  | 'closed'
  | 'vBack'
  | 'illusionBack'
  | 'openBack'
  | 'keyhole'
  | 'buttonRow'
  | 'laceUpCorset'
  | 'drape';

export type SkirtTexture =
  | 'smooth'
  | 'gathered'
  | 'pleated'
  | 'tiered'
  | 'layeredTulle'
  | 'ruffled'
  | 'ruched'
  | 'asymmetricDrape';
export type SlitType = 'none' | 'side' | 'front';
export type TrainLength = 'none' | 'sweep' | 'court' | 'chapel' | 'cathedral';

export type FabricType = 'satin' | 'mikado' | 'organza' | 'tulle' | 'lace' | 'chiffon' | 'taffeta';

export type EmbellishmentType =
  | 'beads'
  | 'laceApplique'
  | 'threeDFlorals'
  | 'crystals'
  | 'pearls'
  | 'embroidery'
  | 'sequins'
  | 'ribbons'
  | 'decorativeButtons';
export type Region = 'bodice' | 'waist' | 'skirt' | 'sleeves' | 'train' | 'allover';

export type ColorEnum =
  | 'pureWhite'
  | 'offWhite'
  | 'ivory'
  | 'champagne'
  | 'blush'
  | 'gold'
  | 'grey'
  | 'blue'
  | 'black';

export type VeilLength =
  | 'none'
  | 'blusher'
  | 'elbow'
  | 'fingertip'
  | 'waltz'
  | 'chapel'
  | 'cathedral';
export type VeilEdge = 'cut' | 'ribbon' | 'beaded' | 'lace';

export type AccessoryType = 'none' | 'tiara' | 'headband' | 'hairVine' | 'hairComb' | 'floralCrown';

export interface Point { x: number; y: number; }

export interface PoseLandmark { x: number; y: number; visibility: number; }
export type PoseLandmarks = Record<string, PoseLandmark>;

export interface AnchorSet {
  headTop: Point;
  chin: Point;
  neckCenter: Point;
  shoulderL: Point;
  shoulderR: Point;
  bust: Point;
  waist: Point;
  hipL: Point;
  hipR: Point;
  kneeL: Point;
  kneeR: Point;
  hemL: Point;
  hemR: Point;
  hemCenter: Point;
}

export interface AppMeta {
  basePhoto: Blob | null;
  poseLandmarks: PoseLandmarks | null;
  createdAt: number;
}

export interface Embellishment {
  type: EmbellishmentType;
  region: Region;
  intensity: 0 | 1 | 2 | 3 | 4 | 5;
  extra?: Record<string, unknown>;
}

export interface DressEntry {
  id: string;
  createdAt: number;
  nickname: string;
  shop: string;
  dressNo: string;
  lightingNote: string;

  anchors: AnchorSet;

  silhouette: SilhouetteType;
  neckline: NecklineType;
  sleeve: { type: SleeveType; material: SleeveMaterial };
  bodice: {
    waistPosition: WaistPosition;
    structure: BodiceStructure;
    accent: WaistAccent;
    accentColor: ColorEnum;
  };
  back: { type: BackType; openDepth: 0 | 1 | 2 | 3 | 4 | 5 };
  skirt: {
    texture: SkirtTexture;
    layers: 2 | 3 | 4 | 5;
    slit: { type: SlitType; height: 0 | 1 | 2 | 3 | 4 | 5 };
    train: TrainLength;
  };
  fabric: {
    bodice: FabricType;
    skirt: FabricType;
    sleeves: FabricType;
    veil: FabricType;
  };
  embellishments: Embellishment[];
  color: {
    primary: ColorEnum;
    gradient: 'solid' | 'ombre';
    secondary?: ColorEnum;
    accent: ColorEnum;
  };
  veil: { length: VeilLength; edge: VeilEdge; layers: 1 | 2 } | null;
  accessory: AccessoryType;

  /** 0..1 inclusive */
  opacity: number;
  sketchPng: string | null;

  categorical: {
    necklineNotes: string[];
    sleeveNotes: string[];
    backNotes: string[];
    fabricNotes: string[];
    trainNotes: string[];
  };
  quotes: { bride: string; groom: string };
  ratings: {
    firstImpression: 1 | 2 | 3 | 4 | 5;
    fit: 1 | 2 | 3 | 4 | 5;
    comfort: 1 | 2 | 3 | 4 | 5;
    weddingFeel: 1 | 2 | 3 | 4 | 5;
  };
  pros: string[];
  cons: string[];
}

export function createDefaultEntry(id: string, anchors: AnchorSet): DressEntry {
  return {
    id,
    createdAt: Date.now(),
    nickname: '',
    shop: '',
    dressNo: '',
    lightingNote: '',

    anchors,

    silhouette: 'aline',
    neckline: 'sweetheart',
    sleeve: { type: 'sleeveless', material: 'opaque' },
    bodice: {
      waistPosition: 'natural',
      structure: 'softFit',
      accent: 'none',
      accentColor: 'pureWhite',
    },
    back: { type: 'closed', openDepth: 0 },
    skirt: {
      texture: 'smooth',
      layers: 3,
      slit: { type: 'none', height: 0 },
      train: 'none',
    },
    fabric: {
      bodice: 'satin',
      skirt: 'satin',
      sleeves: 'satin',
      veil: 'tulle',
    },
    embellishments: [],
    color: { primary: 'pureWhite', gradient: 'solid', accent: 'pureWhite' },
    veil: null,
    accessory: 'none',

    opacity: 1.0,
    sketchPng: null,

    categorical: {
      necklineNotes: [],
      sleeveNotes: [],
      backNotes: [],
      fabricNotes: [],
      trainNotes: [],
    },
    quotes: { bride: '', groom: '' },
    ratings: {
      firstImpression: 3,
      fit: 3,
      comfort: 3,
      weddingFeel: 3,
    },
    pros: [],
    cons: [],
  };
}
