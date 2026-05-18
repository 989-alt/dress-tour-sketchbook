import type { PointerEvent } from 'react';
import type { AnchorSet } from '../types';
import { MESH_ANCHOR_ORDER } from '../lib/warp';

export interface AnchorOverlayProps {
  anchors: AnchorSet;
  confidence?: Record<string, number>;
  photoWidth: number;
  photoHeight: number;
  displayWidth: number;
  displayHeight: number;
  manualMode?: boolean;
  onChange: (next: AnchorSet) => void;
}

const MANUAL_ANCHORS = new Set<keyof AnchorSet>([
  'shoulderL', 'shoulderR', 'waist', 'hemL', 'hemR',
]);

function dotStyle(conf?: number): { background: string; border: string } {
  if (conf === undefined) return { background: '#fff', border: '2px solid #fff' };
  if (conf > 0.7) return { background: '#333', border: '2px solid #fff' };
  if (conf > 0.4) return { background: '#f5c518', border: '2px solid #f5c518' };
  return { background: '#888', border: '2px solid #888' };
}

export function AnchorOverlay({
  anchors,
  confidence,
  photoWidth,
  photoHeight,
  displayWidth,
  displayHeight,
  manualMode = false,
  onChange,
}: AnchorOverlayProps) {
  const scaleX = displayWidth / photoWidth;
  const scaleY = displayHeight / photoHeight;

  const draggableKeys = MESH_ANCHOR_ORDER.filter((key) =>
    manualMode ? MANUAL_ANCHORS.has(key) : true,
  );

  function handlePointerDown(_key: keyof AnchorSet, e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(key: keyof AnchorSet, e: PointerEvent<HTMLDivElement>) {
    if ((e.buttons & 1) === 0) return;
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;
    const photoX = Math.round(dx / scaleX);
    const photoY = Math.round(dy / scaleY);
    onChange({ ...anchors, [key]: { x: photoX, y: photoY } });
  }

  function handlePointerUp(_key: keyof AnchorSet, e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-label="anchor-overlay"
    >
      {draggableKeys.map((key) => {
        const pt = anchors[key];
        const cx = pt.x * scaleX;
        const cy = pt.y * scaleY;
        const conf = confidence?.[key];
        const ds = dotStyle(conf);
        return (
          <div
            key={key}
            role="button"
            aria-label={`anchor-${key}`}
            data-anchor={key}
            onPointerDown={(e) => handlePointerDown(key, e)}
            onPointerMove={(e) => handlePointerMove(key, e)}
            onPointerUp={(e) => handlePointerUp(key, e)}
            style={{
              position: 'absolute',
              width: 14,
              height: 14,
              borderRadius: '50%',
              left: cx - 7,
              top: cy - 7,
              background: ds.background,
              border: ds.border,
              cursor: 'grab',
              pointerEvents: 'auto',
              touchAction: 'none',
            }}
          />
        );
      })}
    </div>
  );
}
