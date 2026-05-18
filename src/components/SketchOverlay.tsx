import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent,
} from 'react';

export interface SketchOverlayProps {
  photoWidth: number;
  photoHeight: number;
  displayWidth: number;
  displayHeight: number;
  initialPng?: string | null;
  brushSize?: 'thin' | 'medium' | 'thick';
  color?: 'black' | 'navy' | 'red';
  eraser?: boolean;
  acceptFinger?: boolean;
  onChange?: (png: string | null) => void;
}

export interface SketchOverlayHandle {
  undo(): void;
  clear(): void;
}

const BRUSH_PX: Record<string, number> = { thin: 2, medium: 4, thick: 8 };
const COLOR_MAP: Record<string, string> = {
  black: '#222',
  navy: '#1a3a72',
  red: '#c0392b',
};
const UNDO_LIMIT = 10;

export const SketchOverlay = forwardRef<SketchOverlayHandle, SketchOverlayProps>(
  function SketchOverlay(
    {
      photoWidth,
      photoHeight,
      displayWidth,
      displayHeight,
      initialPng,
      brushSize = 'medium',
      color = 'black',
      eraser = false,
      acceptFinger = false,
      onChange,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const undoStack = useRef<ImageData[]>([]);
    const isDrawing = useRef(false);
    const hasMoved = useRef(false);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);

    // Load initial PNG
    useEffect(() => {
      if (!initialPng) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, photoWidth, photoHeight);
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialPng;
    }, [initialPng, photoWidth, photoHeight]);

    useImperativeHandle(ref, () => ({
      undo() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const snap = undoStack.current.pop();
        if (snap) {
          ctx.putImageData(snap, 0, 0);
          onChange?.(canvas.toDataURL('image/png'));
        }
      },
      clear() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        pushUndo(ctx, canvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onChange?.(null);
      },
    }));

    function applyDrawStyle(ctx: CanvasRenderingContext2D, isEraser: boolean, drawColor: string, size: string) {
      const paint = isEraser ? 'rgba(0,0,0,1)' : COLOR_MAP[drawColor];
      ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
      ctx.fillStyle = paint;
      ctx.strokeStyle = paint;
      ctx.lineWidth = BRUSH_PX[size];
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    function pushUndo(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (undoStack.current.length >= UNDO_LIMIT) undoStack.current.shift();
      undoStack.current.push(snap);
    }

    const coordScaleX = photoWidth / displayWidth;
    const coordScaleY = photoHeight / displayHeight;

    function toPhotoCoords(e: PointerEvent<HTMLCanvasElement>) {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * coordScaleX,
        y: (e.clientY - rect.top) * coordScaleY,
      };
    }

    function shouldIgnore(e: PointerEvent<HTMLCanvasElement>): boolean {
      if (acceptFinger) return false;
      return e.pointerType === 'touch';
    }

    function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
      if (shouldIgnore(e)) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.setPointerCapture(e.pointerId);
      pushUndo(ctx, canvas);
      isDrawing.current = true;
      hasMoved.current = false;

      const pt = toPhotoCoords(e);
      if (!pt) return;
      lastPoint.current = pt;

      applyDrawStyle(ctx, eraser, color, brushSize);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, BRUSH_PX[brushSize] / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
      if (!isDrawing.current || shouldIgnore(e)) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pt = toPhotoCoords(e);
      if (!pt) return;

      const prev = lastPoint.current ?? pt;
      applyDrawStyle(ctx, eraser, color, brushSize);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();

      lastPoint.current = pt;
      hasMoved.current = true;
    }

    function finishStroke(e: PointerEvent<HTMLCanvasElement>) {
      isDrawing.current = false;
      lastPoint.current = null;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.releasePointerCapture(e.pointerId);
      onChange?.(canvas.toDataURL('image/png'));
    }

    function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
      if (!isDrawing.current) return;
      finishStroke(e);
    }

    function onPointerLeave(e: PointerEvent<HTMLCanvasElement>) {
      if (!isDrawing.current || !hasMoved.current) return;
      finishStroke(e);
    }

    // forwardRef + imperative handle + draw logic = structural floor ~210 lines
    return (
      <canvas
        ref={canvasRef}
        width={photoWidth}
        height={photoHeight}
        style={{
          position: 'absolute',
          inset: 0,
          width: displayWidth,
          height: displayHeight,
          cursor: eraser ? 'cell' : 'crosshair',
          touchAction: 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        aria-label="sketch-canvas"
      />
    );
  },
);
