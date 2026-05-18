import type { FabricType } from '../../types';
import { FABRICS } from '../../parts/fabrics';
import { FABRIC_GLOSSARY } from '../../lib/glossary';

const FABRIC_ORDER: FabricType[] = ['satin', 'mikado', 'organza', 'tulle', 'lace', 'chiffon', 'taffeta'];

type FabricRegion = 'bodice' | 'skirt' | 'sleeves' | 'veil';

const REGION_LABELS: Record<FabricRegion, string> = {
  bodice:  '상의',
  skirt:   '치마',
  sleeves: '소매',
  veil:    '베일',
};

const REGION_ORDER: FabricRegion[] = ['bodice', 'skirt', 'sleeves', 'veil'];

interface FabricValue {
  bodice: FabricType;
  skirt: FabricType;
  sleeves: FabricType;
  veil: FabricType;
}

interface FabricPanelProps {
  value: FabricValue;
  onChange: (next: FabricValue) => void;
}

export function FabricPanel({ value, onChange }: FabricPanelProps) {
  function setFabric(region: FabricRegion, fabric: FabricType) {
    onChange({ ...value, [region]: fabric });
  }

  return (
    <div className="flex flex-col gap-4">
      {REGION_ORDER.map((region) => (
        <div key={region}>
          <p className="text-xs font-semibold text-gray-600 mb-1">{REGION_LABELS[region]}</p>
          <div className="flex flex-wrap gap-2">
            {FABRIC_ORDER.map((fabric) => {
              const selected = fabric === value[region];
              return (
                <button
                  key={fabric}
                  data-region={region}
                  data-fabric={fabric}
                  onClick={() => setFabric(region, fabric)}
                  title={FABRIC_GLOSSARY[fabric]}
                  className={[
                    'px-2 py-1 rounded border text-xs transition-colors',
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {FABRICS[fabric].label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
