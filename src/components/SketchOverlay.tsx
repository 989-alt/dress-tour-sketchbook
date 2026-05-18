import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import type { RegionPrompt } from '../types';

export interface SketchOverlayProps {
  photoWidth: number;
  photoHeight: number;
  displayWidth: number;
  displayHeight: number;
  brushSize?: 'thin' | 'medium' | 'thick';
  color?: 'black' | 'navy' | 'red';
  acceptFinger?: boolean;
  /** Already-saved region prompts. Rendered as colored overlays. */
  savedRegions: RegionPrompt[];
}

export interface SketchOverlayHandle {
  undoStroke(): void;
  finishRegion(): string | null;
  clearInProgress(): void;
}

const BRUSH_PX: Record<string, number> = { thin: 2, medium: 4, thick: 8 };

const COLOR_MAP: Record<string, string> = {
  black: '#222222',
  navy: '#1a3a72',
  red: '#c0392b',
};

type Stroke = Array<{ x: number; y: number }>;

function buildPathData(strokes: Stroke[]): string {
  return strokes
    .map((pts) => {
      if (pts.length === 0) return '';
      const [first, ...rest] = pts;
      const move = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
      const lines = rest.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      return lines ? `${move} ${lines}` : move;
    })
    .filter(Boolean)
    .join(' ');
}

export const SketchOverlay = forwardRef<SketchOverlayHandle, SketchOverlayProps>(
  function SketchOverlay(
    {
      photoWidth,
      photoHeight,
      displayWidth,
      displayHeight,
      brushSize = 'medium',
      color = 'black',
      acceptFinger = false,
      savedRegions,
    },
    ref,
  ) {
    const [inProgressStrokes, setInProgressStrokes] = useState<Stroke[]>([]);
    const currentStrokeRef = useRef<Stroke>([]);
    const isDrawing = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const coordScaleX = photoWidth / displayWidth;
    const coordScaleY = photoHeight / displayHeight;

    function toPhotoCoords(e: PointerEvent<SVGSVGElement>) {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * coordScaleX,
        y: (e.clientY - rect.top) * coordScaleY,
      };
    }

    function shouldIgnore(e: PointerEvent<SVGSVGElement>): boolean {
      if (acceptFinger) return false;
      return e.pointerType === 'touch';
    }

    function onPointerDown(e: PointerEvent<SVGSVGElement>) {
      if (shouldIgnore(e)) return;
      const pt = toPhotoCoords(e);
      if (!pt) return;
      svgRef.current?.setPointerCapture(e.pointerId);
      isDrawing.current = true;
      currentStrokeRef.current = [pt];
    }

    function onPointerMove(e: PointerEvent<SVGSVGElement>) {
      if (!isDrawing.current || shouldIgnore(e)) return;
      const pt = toPhotoCoords(e);
      if (!pt) return;
      currentStrokeRef.current = [...currentStrokeRef.current, pt];
      // Force re-render to show live stroke
      setInProgressStrokes((prev) => {
        // Replace the last entry with the live stroke if it's the current one;
        // we handle it separately via currentStrokeRef for now but we need a render.
        return [...prev];
      });
    }

    function onPointerUp(e: PointerEvent<SVGSVGElement>) {
      if (!isDrawing.current) return;
      svgRef.current?.releasePointerCapture(e.pointerId);
      isDrawing.current = false;
      const stroke = currentStrokeRef.current;
      currentStrokeRef.current = [];
      if (stroke.length > 0) {
        setInProgressStrokes((prev) => [...prev, stroke]);
      }
    }

    useImperativeHandle(ref, () => ({
      undoStroke() {
        setInProgressStrokes((prev) => prev.slice(0, -1));
      },
      finishRegion() {
        const strokes = inProgressStrokes;
        if (strokes.length === 0) return null;
        const pathData = buildPathData(strokes);
        setInProgressStrokes([]);
        currentStrokeRef.current = [];
        return pathData;
      },
      clearInProgress() {
        setInProgressStrokes([]);
        currentStrokeRef.current = [];
      },
    }));

    const strokeWidth = BRUSH_PX[brushSize];
    const strokeColor = COLOR_MAP[color];

    // Combine committed + live current stroke for display
    const displayStrokes: Stroke[] = isDrawing.current && currentStrokeRef.current.length > 0
      ? [...inProgressStrokes, currentStrokeRef.current]
      : inProgressStrokes;

    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${photoWidth} ${photoHeight}`}
        style={{
          position: 'absolute',
          inset: 0,
          width: displayWidth,
          height: displayHeight,
          cursor: 'crosshair',
          touchAction: 'none',
          overflow: 'visible',
        }}
        aria-label="sketch-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={(e) => { if (isDrawing.current) onPointerUp(e); }}
      >
        {/* Saved regions */}
        {savedRegions.map((region) => (
          <path
            key={region.id}
            d={region.pathData}
            stroke={`hsl(${region.hue}, 70%, 50%)`}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
          />
        ))}

        {/* In-progress strokes */}
        {displayStrokes.map((stroke, i) => {
          if (stroke.length === 0) return null;
          const [first, ...rest] = stroke;
          const d =
            `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}` +
            rest.map((p) => ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
          return (
            <path
              key={i}
              d={d}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="none"
              opacity={0.85}
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />
          );
        })}
      </svg>
    );
  },
);
