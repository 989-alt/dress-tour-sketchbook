import { useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { loadImageWithCorrectOrientation } from '../lib/exif';
import { detectPose, landmarksToAnchors } from '../lib/pose';
import type { AppMeta } from '../types';

interface Props {
  onClose: () => void;
}

type Step =
  | { kind: 'idle' }
  | { kind: 'detecting' }
  | { kind: 'fallback'; blob: Blob }
  | { kind: 'preview'; blob: Blob; meta: AppMeta };

export function PhotoUploadModal({ onClose }: Props) {
  const setMeta = useAppStore((s) => s.setMeta);
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>({ kind: 'idle' });
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File) {
    setStep({ kind: 'detecting' });
    try {
      await loadImageWithCorrectOrientation(file);
      const blob = file as Blob;

      try {
        const detectResult = await detectPose(blob);
        landmarksToAnchors(detectResult); // validate; per-entry anchors set in Edit
        const meta: AppMeta = {
          basePhoto: blob,
          poseLandmarks: detectResult.landmarks,
          createdAt: Date.now(),
        };
        setStep({ kind: 'preview', blob, meta });
      } catch {
        // MediaPipe unavailable or NO_POSE_DETECTED → manual fallback
        setStep({ kind: 'fallback', blob });
      }
    } catch {
      setStep({ kind: 'idle' });
    }
  }

  async function confirmFallback(blob: Blob) {
    setSaving(true);
    const meta: AppMeta = {
      basePhoto: blob,
      poseLandmarks: null,
      createdAt: Date.now(),
    };
    await setMeta(meta);
    setSaving(false);
    onClose();
  }

  async function confirmPreview(meta: AppMeta) {
    setSaving(true);
    await setMeta(meta);
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl leading-none"
          aria-label="취소"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">베이스 사진 업로드</h2>

        {step.kind === 'idle' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-sm text-gray-500 text-center">
              전신이 잘 보이는 사진을 선택해 주세요.
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              사진 선택
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        )}

        {step.kind === 'detecting' && (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            포즈 검출 중…
          </div>
        )}

        {step.kind === 'fallback' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-sm text-gray-600 text-center">
              포즈를 찾지 못했습니다. 수동 배치로 진행하시겠어요?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => confirmFallback(step.blob)}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? '저장 중…' : '수동 배치로 진행'}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {step.kind === 'preview' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-gray-500">포즈 검출 완료! 이 사진으로 진행하시겠어요?</p>
            <div className="flex gap-3">
              <button
                onClick={() => confirmPreview(step.meta)}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? '저장 중…' : '확인'}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
