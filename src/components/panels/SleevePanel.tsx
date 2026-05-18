import type { SleeveType, SleeveMaterial } from '../../types';
import { SLEEVES } from '../../parts/sleeves';
import { SLEEVE_SHORT, SLEEVE_MATERIAL_SHORT } from '../../lib/glossary';
import { PreviewChip } from '../PreviewChip';
import { previewUrl } from '../../lib/previewImages';

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
            <PreviewChip
              key={type}
              selected={selected}
              onClick={() => setType(type)}
              label={def.label}
              description={SLEEVE_SHORT[type]}
              previewSrc={previewUrl('sleeve', type)}
              svgFallback={
                <svg viewBox="60 100 220 400" width={48} height={48} aria-hidden>
                  {def.renders ? (
                    <>
                      <path d={def.paths.left}  fill={selected ? '#93c5fd' : '#d1d5db'} />
                      <path d={def.paths.right} fill={selected ? '#93c5fd' : '#d1d5db'} />
                    </>
                  ) : (
                    <line x1="130" y1="120" x2="270" y2="120" stroke="#9ca3af" strokeWidth="3" />
                  )}
                </svg>
              }
              dataAttrs={{ 'data-sleeve': type }}
            />
          );
        })}
      </div>

      {/* Material chips */}
      <div className="grid grid-cols-2 gap-2">
        {MATERIAL_ORDER.map((mat) => (
          <PreviewChip
            key={mat}
            selected={mat === value.material}
            onClick={() => setMaterial(mat)}
            label={MATERIAL_LABELS[mat]}
            description={SLEEVE_MATERIAL_SHORT[mat]}
            previewSrc={previewUrl('sleeveMaterial', mat)}
            dataAttrs={{ 'data-material': mat }}
          />
        ))}
      </div>
    </div>
  );
}
