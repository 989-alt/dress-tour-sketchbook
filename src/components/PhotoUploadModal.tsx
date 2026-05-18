import { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (step.kind === 'detecting') return;
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, step.kind]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="card-lg relative w-full max-w-lg mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="btn-ghost absolute top-3 right-4 text-xl leading-none"
          aria-label="취소"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-ink-900 mb-4">베이스 사진 업로드</h2>

        {step.kind === 'idle' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-sm text-ink-400 text-center">
              전신이 잘 보이는 사진을 선택해 주세요.
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full py-7 border-2 border-dashed border-rose-200 hover:border-rose-300 hover:bg-rose-50/50 text-rose-500 rounded-xl text-sm font-medium transition-colors"
            >
              <span className="block text-base font-semibold mb-1">사진 선택</span>
              <span className="block text-xs text-ink-400 font-normal">얼굴이 마스킹된 신부 전신 사진 권장</span>
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
          <div className="flex items-center justify-center py-12 text-sm text-ink-400">
            포즈 검출 중…
          </div>
        )}

        {step.kind === 'fallback' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-sm text-ink-900 text-center">
              포즈를 찾지 못했습니다. 수동 배치로 진행하시겠어요?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => confirmFallback(step.blob)}
                disabled={saving}
                className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
              >
                {saving ? '저장 중…' : '수동 배치로 진행'}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 border border-ink-100/60 text-ink-400 rounded-xl text-sm hover:bg-cream-50"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {step.kind === 'preview' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-ink-400">포즈 검출 완료! 이 사진으로 진행하시겠어요?</p>
            <div className="flex gap-3">
              <button
                onClick={() => confirmPreview(step.meta)}
                disabled={saving}
                className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
              >
                {saving ? '저장 중…' : '확인'}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 border border-ink-100/60 text-ink-400 rounded-xl text-sm hover:bg-cream-50"
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
