import type { WaistPosition, BodiceStructure, WaistAccent, ColorEnum } from '../../types';
import { STRUCTURES, ACCENTS } from '../../parts/bodices';
import { COLOR_HEX } from '../../lib/colorPalette';
import {
  WAIST_POSITION_GLOSSARY,
  BODICE_STRUCTURE_GLOSSARY,
  WAIST_ACCENT_GLOSSARY,
} from '../../lib/glossary';

const WAIST_POSITIONS: Array<{ value: WaistPosition; label: string }> = [
  { value: 'natural',    label: '자연' },
  { value: 'empire',     label: '엠파이어' },
  { value: 'basque',     label: '베이스크' },
  { value: 'drop',       label: '드롭' },
  { value: 'asymmetric', label: '비대칭' },
];

const STRUCTURE_ORDER: BodiceStructure[] = ['corset', 'softFit', 'peplum', 'mockPeplum'];
const ACCENT_ORDER: WaistAccent[] = ['none', 'sash', 'ribbon', 'brooch', 'beadedBand'];

const COLOR_ORDER: ColorEnum[] = [
  'pureWhite', 'offWhite', 'ivory', 'champagne', 'blush',
  'gold', 'grey', 'blue', 'black',
];

interface BodicePanelProps {
  value: {
    waistPosition: WaistPosition;
    structure: BodiceStructure;
    accent: WaistAccent;
    accentColor: ColorEnum;
  };
  onChange: (next: BodicePanelProps['value']) => void;
}

function ChipButton({
  selected,
  onClick,
  dataAttr,
  dataValue,
  label,
  title,
}: {
  selected: boolean;
  onClick: () => void;
  dataAttr: string;
  dataValue: string;
  label: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      {...{ [dataAttr]: dataValue }}
      title={title}
      className={[
        'px-2 py-1 rounded border text-xs transition-colors',
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export function BodicePanel({ value, onChange }: BodicePanelProps) {
  function set(patch: Partial<typeof value>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 허리 위치 */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1">허리 위치</p>
        <div className="flex flex-wrap gap-2">
          {WAIST_POSITIONS.map(({ value: v, label }) => (
            <ChipButton
              key={v}
              selected={v === value.waistPosition}
              onClick={() => set({ waistPosition: v })}
              dataAttr="data-waist-position"
              dataValue={v}
              label={label}
              title={WAIST_POSITION_GLOSSARY[v]}
            />
          ))}
        </div>
      </div>

      {/* 보디스 구조 */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1">보디스 구조</p>
        <div className="flex flex-wrap gap-2">
          {STRUCTURE_ORDER.map((s) => (
            <ChipButton
              key={s}
              selected={s === value.structure}
              onClick={() => set({ structure: s })}
              dataAttr="data-structure"
              dataValue={s}
              label={STRUCTURES[s].label}
              title={BODICE_STRUCTURE_GLOSSARY[s]}
            />
          ))}
        </div>
      </div>

      {/* 허리 액센트 */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1">허리 액센트</p>
        <div className="flex flex-wrap gap-2">
          {ACCENT_ORDER.map((a) => (
            <ChipButton
              key={a}
              selected={a === value.accent}
              onClick={() => set({ accent: a })}
              dataAttr="data-accent"
              dataValue={a}
              label={ACCENTS[a].label}
              title={WAIST_ACCENT_GLOSSARY[a]}
            />
          ))}
        </div>
      </div>

      {/* 액센트 색상 */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1">액센트 색상</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_ORDER.map((c) => (
            <button
              key={c}
              data-accent-color={c}
              onClick={() => set({ accentColor: c })}
              title={c}
              className={[
                'w-6 h-6 rounded-full border-2 transition-colors',
                c === value.accentColor ? 'border-blue-500' : 'border-gray-300',
              ].join(' ')}
              style={{ backgroundColor: COLOR_HEX[c] }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
