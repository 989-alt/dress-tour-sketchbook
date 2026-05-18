import type { FabricType } from '../../types';
import { FABRICS } from '../../parts/fabrics';
import { FABRIC_SHORT } from '../../lib/glossary';
import { PreviewChip } from '../PreviewChip';
import { previewUrl } from '../../lib/previewImages';

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

function FabricChip({
  fabric,
  region,
  selected,
  onSelect,
}: {
  fabric: FabricType;
  region: FabricRegion;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <PreviewChip
      selected={selected}
      onClick={onSelect}
      label={FABRICS[fabric].label}
      description={FABRIC_SHORT[fabric]}
      previewSrc={previewUrl('fabric', fabric)}
      dataAttrs={{ 'data-region': region, 'data-fabric': fabric }}
    />
  );
}

export function FabricPanel({ value, onChange }: FabricPanelProps) {
  function setFabric(region: FabricRegion, fabric: FabricType) {
    onChange({ ...value, [region]: fabric });
  }

  return (
    <div className="flex flex-col gap-4">
      {REGION_ORDER.map((region) => (
        <div key={region}>
          <p className="label-caps mb-1">{REGION_LABELS[region]}</p>
          <div className="grid grid-cols-4 gap-1">
            {FABRIC_ORDER.map((fabric) => (
              <FabricChip
                key={fabric}
                fabric={fabric}
                region={region}
                selected={fabric === value[region]}
                onSelect={() => setFabric(region, fabric)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
