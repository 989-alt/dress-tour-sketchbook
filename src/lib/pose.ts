import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import type { PoseLandmarks, AnchorSet, Point } from '../types';

export interface DetectResult {
  landmarks: PoseLandmarks;
  confidence: Record<string, number>;
  imageWidth: number;
  imageHeight: number;
}

// MediaPipe Pose canonical 33-point landmark order
export const LANDMARK_NAMES: readonly string[] = [
  'nose',
  'leftEyeInner',
  'leftEye',
  'leftEyeOuter',
  'rightEyeInner',
  'rightEye',
  'rightEyeOuter',
  'leftEar',
  'rightEar',
  'mouthLeft',
  'mouthRight',
  'leftShoulder',
  'rightShoulder',
  'leftElbow',
  'rightElbow',
  'leftWrist',
  'rightWrist',
  'leftPinky',
  'rightPinky',
  'leftIndex',
  'rightIndex',
  'leftThumb',
  'rightThumb',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
  'leftHeel',
  'rightHeel',
  'leftFootIndex',
  'rightFootIndex',
] as const;

// Singleton landmarker — lazy init
let landmarkerPromise: Promise<PoseLandmarker> | null = null;

// MediaPipe assets loaded from CDNs (jsdelivr for WASM, Google storage for model).
// Photo data never leaves the browser; only static ML assets are fetched.
const MEDIAPIPE_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm';
const POSE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

function getLandmarker(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: POSE_MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    })();
  }
  return landmarkerPromise;
}

export async function detectPose(blob: Blob): Promise<DetectResult> {
  const bitmap = await createImageBitmap(blob);
  const imageWidth = bitmap.width;
  const imageHeight = bitmap.height;

  const landmarker = await getLandmarker();
  const result = landmarker.detect(bitmap);
  bitmap.close();

  if (!result.landmarks || result.landmarks.length === 0) {
    throw new Error('NO_POSE_DETECTED');
  }

  const raw = result.landmarks[0];
  const landmarks: PoseLandmarks = {};
  const confidence: Record<string, number> = {};

  for (let i = 0; i < LANDMARK_NAMES.length; i++) {
    const name = LANDMARK_NAMES[i];
    const lm = raw[i];
    landmarks[name] = {
      x: lm.x * imageWidth,
      y: lm.y * imageHeight,
      visibility: lm.visibility ?? 0,
    };
    confidence[name] = lm.visibility ?? 0;
  }

  return { landmarks, confidence, imageWidth, imageHeight };
}

// ---- Anchor geometry helpers ----

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function landmarksToAnchors(detect: DetectResult): AnchorSet {
  const lm = detect.landmarks;

  const nose = lm['nose'];
  const leftEye = lm['leftEye'];
  const leftEar = lm['leftEar'];
  const leftShoulder = lm['leftShoulder'];
  const rightShoulder = lm['rightShoulder'];
  const leftHip = lm['leftHip'];
  const rightHip = lm['rightHip'];
  const leftKnee = lm['leftKnee'];
  const rightKnee = lm['rightKnee'];
  const leftAnkle = lm['leftAnkle'];
  const rightAnkle = lm['rightAnkle'];

  const midShoulder = midpoint(leftShoulder, rightShoulder);
  const midHip = midpoint(leftHip, rightHip);

  // headTop: nose shifted upward by 1.5 * |leftEye.y - leftEar.y|
  const eyeEarDy = Math.abs(leftEye.y - leftEar.y);
  const headTop: Point = {
    x: nose.x,
    y: Math.max(0, nose.y - 1.5 * eyeEarDy),
  };

  // chin: nose shifted down by |nose - leftEye| distance
  const chinOffset = dist(nose, leftEye);
  const chin: Point = { x: nose.x, y: nose.y + chinOffset };

  // neckCenter: midShoulder shifted up by 20% of shoulder→hip vector
  const shoulderHipVecY = midHip.y - midShoulder.y;
  const neckCenter: Point = {
    x: midShoulder.x,
    y: midShoulder.y - 0.2 * shoulderHipVecY,
  };

  // bust: midpoint of midShoulder and midHip, then 35% toward shoulder
  // = midHip + 0.5*(midShoulder - midHip) + 0.35*(midShoulder - (midHip + 0.5*(midShoulder-midHip)))
  // Simplified: midHip + (0.5 + 0.35*0.5)*(midShoulder - midHip) = midHip + 0.675*(midShoulder-midHip)
  // Actually: midpoint(midShoulder, midHip) + 35% toward shoulder from that midpoint:
  const midTorso = midpoint(midShoulder, midHip);
  const bust: Point = {
    x: midTorso.x + 0.35 * (midShoulder.x - midTorso.x),
    y: midTorso.y + 0.35 * (midShoulder.y - midTorso.y),
  };

  // waist: midHip + 0.25 * (midShoulder - midHip)
  const waist: Point = {
    x: midHip.x + 0.25 * (midShoulder.x - midHip.x),
    y: midHip.y + 0.25 * (midShoulder.y - midHip.y),
  };

  const hemCenter = midpoint(leftAnkle, rightAnkle);

  return {
    headTop,
    chin,
    neckCenter,
    shoulderL: { x: leftShoulder.x, y: leftShoulder.y },
    shoulderR: { x: rightShoulder.x, y: rightShoulder.y },
    bust,
    waist,
    hipL: { x: leftHip.x, y: leftHip.y },
    hipR: { x: rightHip.x, y: rightHip.y },
    kneeL: { x: leftKnee.x, y: leftKnee.y },
    kneeR: { x: rightKnee.x, y: rightKnee.y },
    hemL: { x: leftAnkle.x, y: leftAnkle.y },
    hemR: { x: rightAnkle.x, y: rightAnkle.y },
    hemCenter,
  };
}

export function landmarksToConfidence(landmarks: PoseLandmarks): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [name, lm] of Object.entries(landmarks)) {
    result[name] = lm.visibility;
  }
  return result;
}
