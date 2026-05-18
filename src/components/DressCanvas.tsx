import { cloneElement, useEffect, useRef, useState } from 'react';
import type { DressEntry, AnchorSet } from '../types';
import { composeDress } from '../lib/compose';
import { AnchorOverlay } from './AnchorOverlay';
import { SketchOverlay } from './SketchOverlay';

export interface DressCanvasProps {
  photo: Blob;
  photoWidth: number;
  photoHeight: number;
  entry: DressEntry;
  anchors: AnchorSet;
  confidence?: Record<string, number>;
  showAnchors?: boolean;
  showSketch?: boolean;
  onAnchorChange?: (next: AnchorSet) => void;
  onSketchChange?: (sketchPng: string | null) => void;
  manualMode?: boolean;
  className?: string;
  /** When set, the AI-generated image replaces the photo + SVG composition. */
  aiResultDataUrl?: string | null;
}

export function DressCanvas({
  photo,
  photoWidth,
  photoHeight,
  entry,
  anchors,
  confidence,
  showAnchors = false,
  showSketch = false,
  onAnchorChange,
  onSketchChange,
  manualMode = false,
  className,
  aiResultDataUrl,
}: DressCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [objectURL, setObjectURL] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [displaySize, setDisplaySize] = useState({ w: photoWidth, h: photoHeight });

  // Object URL lifecycle
  useEffect(() => {
    const url = URL.createObjectURL(photo);
    setObjectURL(url);
    setLoadError(false);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  // ResizeObserver for display size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width } = entry.contentRect;
      const height = (width / photoWidth) * photoHeight;
      setDisplaySize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [photoWidth, photoHeight]);

  const dressSvg = composeDress(entry, anchors, {
    photoWidth,
    photoHeight,
    idPrefix: `dc-${entry.id}-`,
  });
  const scaledSvg = cloneElement(dressSvg, { width: displaySize.w, height: displaySize.h });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${photoWidth} / ${photoHeight}`,
        overflow: 'hidden',
      }}
    >
      {aiResultDataUrl ? (
        /* AI result replaces photo + SVG */
        <img
          src={aiResultDataUrl}
          alt="AI 합성 결과"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <>
          {/* Layer 1: photo */}
          {objectURL && !loadError && (
            <img
              src={objectURL}
              alt=""
              onError={() => setLoadError(true)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                pointerEvents: 'none',
              }}
            />
          )}

          {loadError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: '#c0392b',
              }}
            >
              사진을 불러올 수 없습니다
            </div>
          )}

          {/* Layer 2: warped dress SVG — viewBox stays at photo coords, width/height = display */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {scaledSvg}
          </div>
        </>
      )}

      {/* Layer 3: anchor overlay */}
      {showAnchors && (
        <AnchorOverlay
          anchors={anchors}
          confidence={confidence}
          photoWidth={photoWidth}
          photoHeight={photoHeight}
          displayWidth={displaySize.w}
          displayHeight={displaySize.h}
          manualMode={manualMode}
          onChange={onAnchorChange ?? (() => undefined)}
        />
      )}

      {/* Layer 4: sketch overlay */}
      {showSketch && (
        <SketchOverlay
          photoWidth={photoWidth}
          photoHeight={photoHeight}
          displayWidth={displaySize.w}
          displayHeight={displaySize.h}
          initialPng={entry.sketchPng}
          onChange={onSketchChange}
        />
      )}
    </div>
  );
}
