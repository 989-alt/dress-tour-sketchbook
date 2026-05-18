import type { VeilLength, VeilEdge } from '../../types';
import { VEIL_LENGTHS, VEIL_LENGTH_ORDER, VEIL_EDGES, VEIL_EDGE_ORDER } from '../../parts/veils';
import { VEIL_LENGTH_SHORT, VEIL_EDGE_SHORT } from '../../lib/glossary';
import { PreviewChip } from '../PreviewChip';
import { previewUrl } from '../../lib/previewImages';

interface VeilPanelProps {
  value: { length: VeilLength; edge: VeilEdge; layers: 1 | 2 } | null;
  onChange: (next: { length: VeilLength; edge: VeilEdge; layers: 1 | 2 } | null) => void;
}

function chip(active: boolean) {
  return [
    'px-2 py-1 rounded-xl border text-xs transition-colors',
    active
      ? 'border-rose-400 bg-rose-50 text-rose-600'
      : 'border-ink-100/60 bg-cream-50 text-ink-900 hover:bg-cream-100',
  ].join(' ');
}

export function VeilPanel({ value, onChange }: VeilPanelProps) {
  const length: VeilLength = value?.length ?? 'none';
  const edge: VeilEdge = value?.edge ?? 'cut';
  const layers: 1 | 2 = value?.layers ?? 1;
  const hasVeil = value !== null && length !== 'none';

  function setLength(l: VeilLength) {
    if (l === 'none') { onChange(null); return; }
    if (!value) { onChange({ length: l, edge: 'cut', layers: 1 }); return; }
    onChange({ ...value, length: l });
  }

  function setEdge(e: VeilEdge) {
    if (!value) return;
    onChange({ ...value, edge: e });
  }

  function setLayers(n: 1 | 2) {
    if (!value) return;
    onChange({ ...value, layers: n });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Length */}
      <div>
        <p className="label-caps mb-1">길이</p>
        <div className="grid grid-cols-3 gap-2">
          {VEIL_LENGTH_ORDER.map((l) => (
            <PreviewChip
              key={l}
              selected={length === l}
              onClick={() => setLength(l)}
              label={VEIL_LENGTHS[l].label}
              description={VEIL_LENGTH_SHORT[l]}
              previewSrc={previewUrl('veilLength', l)}
              dataAttrs={{ 'data-veil-length': l }}
            />
          ))}
        </div>
      </div>

      {/* Edge — only when veil is active */}
      {hasVeil && (
        <div>
          <p className="label-caps mb-1">가장자리</p>
          <div className="grid grid-cols-2 gap-2">
            {VEIL_EDGE_ORDER.map((e) => (
              <PreviewChip
                key={e}
                selected={edge === e}
                onClick={() => setEdge(e)}
                label={VEIL_EDGES[e].label}
                description={VEIL_EDGE_SHORT[e]}
                previewSrc={previewUrl('veilEdge', e)}
                dataAttrs={{ 'data-veil-edge': e }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Layers — only when veil is active */}
      {hasVeil && (
        <div>
          <p className="label-caps mb-1">레이어</p>
          <div className="flex gap-2">
            <button
              type="button"
              data-veil-layers={1}
              onClick={() => setLayers(1)}
              className={chip(layers === 1)}
            >
              단일
            </button>
            <button
              type="button"
              data-veil-layers={2}
              onClick={() => setLayers(2)}
              className={chip(layers === 2)}
            >
              블러셔 + 메인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
