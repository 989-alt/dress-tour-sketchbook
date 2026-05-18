import type { SleeveType, SleeveMaterial } from '../../types';
import { SLEEVES } from '../../parts/sleeves';

const SLEEVE_ORDER: SleeveType[] = [
  'sleeveless', 'cap', 'short', 'threeQuarter', 'long',
  'bishop', 'puff', 'bell', 'legOfMutton', 'illusion',
];

const MATERIAL_ORDER: SleeveMaterial[] = ['opaque', 'sheer', 'lace', 'beaded'];

const MATERIAL_LABELS: Record<SleeveMaterial, string> = {
  opaque: '불투명',
  sheer:  '시스루',
  lace:   '레이스',
  beaded: '비즈',
};

interface SleevePanelProps {
  value: { type: SleeveType; material: SleeveMaterial };
  onChange: (next: { type: SleeveType; material: SleeveMaterial }) => void;
}

export function SleevePanel({ value, onChange }: SleevePanelProps) {
  function setType(type: SleeveType) {
    onChange({ ...value, type });
  }
  function setMaterial(material: SleeveMaterial) {
    onChange({ ...value, material });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Sleeve type grid */}
      <div className="grid grid-cols-3 gap-2">
        {SLEEVE_ORDER.map((type) => {
          const def = SLEEVES[type];
          const selected = type === value.type;
          return (
            <button
              key={type}
              onClick={() => setType(type)}
              data-sleeve={type}
              className={[
                'flex flex-col items-center gap-1 p-2 rounded border transition-colors',
                selected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50',
              ].join(' ')}
            >
              <svg viewBox="60 100 220 400" width={48} height={48} aria-hidden>
                {def.renders ? (
                  <>
                    <path d={def.paths.left}  fill={selected ? '#93c5fd' : '#d1d5db'} />
                    <path d={def.paths.right} fill={selected ? '#93c5fd' : '#d1d5db'} />
                  </>
                ) : (
                  /* sleeveless — show shoulder line */
                  <line x1="130" y1="120" x2="270" y2="120" stroke="#9ca3af" strokeWidth="3" />
                )}
              </svg>
              <span className="text-xs text-gray-700 leading-tight text-center">{def.label}</span>
            </button>
          );
        })}
      </div>

      {/* Material chips */}
      <div className="flex gap-2 flex-wrap">
        {MATERIAL_ORDER.map((mat) => {
          const selected = mat === value.material;
          return (
            <button
              key={mat}
              onClick={() => setMaterial(mat)}
              data-material={mat}
              className={[
                'px-3 py-1 rounded-full border text-xs transition-colors',
                selected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {MATERIAL_LABELS[mat]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
