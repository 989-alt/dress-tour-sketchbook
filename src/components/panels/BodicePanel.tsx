import type { WaistPosition, BodiceStructure, WaistAccent, ColorEnum } from '../../types';
import { STRUCTURES, ACCENTS } from '../../parts/bodices';
import { COLOR_HEX } from '../../lib/colorPalette';
import {
  WAIST_POSITION_SHORT,
  BODICE_STRUCTURE_SHORT,
  WAIST_ACCENT_SHORT,
} from '../../lib/glossary';
import { PreviewChip } from '../PreviewChip';
import { previewUrl } from '../../lib/previewImages';

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

export function BodicePanel({ value, onChange }: BodicePanelProps) {
  function set(patch: Partial<typeof value>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 허리 위치 */}
      <div>
        <p className="label-caps mb-1">허리 위치</p>
        <div className="grid grid-cols-3 gap-2">
          {WAIST_POSITIONS.map(({ value: v, label }) => (
            <PreviewChip
              key={v}
              selected={v === value.waistPosition}
              onClick={() => set({ waistPosition: v })}
              label={label}
              description={WAIST_POSITION_SHORT[v]}
              previewSrc={previewUrl('waistPosition', v)}
              dataAttrs={{ 'data-waist-position': v }}
            />
          ))}
        </div>
      </div>

      {/* 보디스 구조 */}
      <div>
        <p className="label-caps mb-1">보디스 구조</p>
        <div className="grid grid-cols-2 gap-2">
          {STRUCTURE_ORDER.map((s) => (
            <PreviewChip
              key={s}
              selected={s === value.structure}
              onClick={() => set({ structure: s })}
              label={STRUCTURES[s].label}
              description={BODICE_STRUCTURE_SHORT[s]}
              previewSrc={previewUrl('bodiceStructure', s)}
              dataAttrs={{ 'data-structure': s }}
            />
          ))}
        </div>
      </div>

      {/* 허리 액센트 */}
      <div>
        <p className="label-caps mb-1">허리 액센트</p>
        <div className="grid grid-cols-3 gap-2">
          {ACCENT_ORDER.map((a) => (
            <PreviewChip
              key={a}
              selected={a === value.accent}
              onClick={() => set({ accent: a })}
              label={ACCENTS[a].label}
              description={WAIST_ACCENT_SHORT[a]}
              previewSrc={previewUrl('waistAccent', a)}
              dataAttrs={{ 'data-accent': a }}
            />
          ))}
        </div>
      </div>

      {/* 액센트 색상 */}
      <div>
        <p className="label-caps mb-1">액센트 색상</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              data-accent-color={c}
              onClick={() => set({ accentColor: c })}
              className={[
                'w-6 h-6 rounded-full border-2 transition-colors',
                c === value.accentColor ? 'border-rose-400 ring-1 ring-rose-200' : 'border-ink-100/60',
              ].join(' ')}
              style={{ backgroundColor: COLOR_HEX[c] }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
