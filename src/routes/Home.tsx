import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { PhotoUploadModal } from '../components/PhotoUploadModal';
import { EntryCard } from '../components/EntryCard';
import { exportAllToJson, downloadJsonFile, importFromJson } from '../lib/exportJson';

export default function Home() {
  const navigate = useNavigate();
  const meta = useAppStore((s) => s.meta);
  const entries = useAppStore((s) => s.entries);
  const { setMeta, upsertEntry } = useAppStore();
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPhoto = Boolean(meta?.basePhoto);

  async function handleJsonExport() {
    try {
      const json = await exportAllToJson(meta, entries);
      await downloadJsonFile(json);
    } catch {
      alert('JSON 내보내기에 실패했습니다.');
    }
  }

  function handleJsonImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const text = await file.text();
    let imported: Awaited<ReturnType<typeof importFromJson>>;
    try {
      imported = await importFromJson(text);
    } catch (err) {
      const msg = (err as { message?: string }).message ?? '알 수 없는 오류';
      alert(`가져오기 실패: ${msg}`);
      return;
    }

    const confirmed = window.confirm('기존 데이터를 덮어쓰시겠어요?');
    if (!confirmed) return;

    if (imported.meta) {
      await setMeta(imported.meta);
    }
    for (const entry of imported.entries) {
      await upsertEntry(entry);
    }
    alert(`가져오기 완료 (드레스 ${imported.entries.length}개)`);
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Top brand strip */}
      <header className="border-b border-ink-100/60 bg-cream-50/80 backdrop-blur supports-[backdrop-filter]:bg-cream-50/60">
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤍</span>
            <span className="font-semibold tracking-tight text-ink-900">드레스 투어 스케치북</span>
          </div>
          <span className="hidden sm:inline label-caps">AI 웨딩드레스 합성</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 pt-10 pb-16">
        {/* Hero */}
        <section className="text-center mb-9" style={{ wordBreak: 'keep-all' }}>
          <h1 className="heading-display text-[28px] sm:text-[42px]">
            오늘 시착한 드레스를
            <br />
            <span className="hero-accent">기억하기</span> 좋게.
          </h1>
          <p className="mt-4 text-ink-400 text-[15px] sm:text-base leading-relaxed max-w-md mx-auto">
            매장에서 본 드레스를 신부 사진 위에 AI로 합성하고,
            <br className="hidden sm:inline" /> 여러 드레스를 나란히 비교하세요.
          </p>
        </section>

        {/* Main card */}
        <section className="card p-6 sm:p-8 space-y-7">
          <header className="text-center">
            <h2 className="font-display text-xl font-bold text-ink-900">시작하기</h2>
            <p className="mt-1 text-sm text-ink-400">
              먼저 베이스 사진을 등록한 다음, 드레스를 추가하세요.
            </p>
          </header>

          {/* Photo step */}
          <div>
            <p className="label-caps mb-2.5">1 · 베이스 사진</p>
            {!hasPhoto ? (
              <button
                onClick={() => setShowUpload(true)}
                className="w-full py-7 border-2 border-dashed border-rose-200 hover:border-rose-300 hover:bg-rose-50/50 text-rose-500 rounded-xl text-sm font-medium transition-colors"
              >
                <span className="block text-base font-semibold mb-1">사진 업로드 + 포즈 검출</span>
                <span className="block text-xs text-ink-400 font-normal">
                  얼굴이 마스킹된 신부 전신 사진 권장
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-4 p-3 bg-cream-50 rounded-xl border border-ink-100/60">
                <PhotoThumb photo={meta!.basePhoto!} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900">사진 준비됨</p>
                  <p className="text-xs text-ink-400 mt-0.5">언제든 변경할 수 있어요</p>
                </div>
                <button
                  onClick={() => setShowUpload(true)}
                  className="text-xs font-medium text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  변경
                </button>
              </div>
            )}
          </div>

          {/* Add dress step */}
          <div>
            <p className="label-caps mb-2.5">2 · 드레스 합성</p>
            {hasPhoto ? (
              <button
                onClick={() => navigate('/new')}
                className="btn-primary w-full py-3.5 text-base"
              >
                + 새 드레스 추가
              </button>
            ) : (
              <div className="w-full py-3.5 text-center text-sm text-ink-400 border border-dashed border-ink-100/80 rounded-xl bg-cream-50">
                먼저 베이스 사진을 등록해 주세요
              </div>
            )}
          </div>

          {/* Entry grid (only when entries exist) */}
          {entries.length > 0 && (
            <div className="pt-3 border-t border-ink-100/60">
              <div className="flex items-baseline justify-between mb-3">
                <p className="label-caps">내 드레스 · {entries.length}</p>
                <button
                  onClick={() => navigate('/summary')}
                  className="text-xs font-medium text-rose-500 hover:text-rose-600"
                >
                  전체 보기 →
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {entries.slice(0, 6).map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => navigate(`/edit/${entry.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Quiet utility footer */}
        <footer className="mt-6 flex items-center justify-center gap-6 text-xs">
          <button onClick={() => navigate('/summary')} className="btn-ghost">
            요약 보기
          </button>
          <span className="text-ink-100">·</span>
          <button onClick={handleJsonExport} className="btn-ghost">
            JSON 받기
          </button>
          <span className="text-ink-100">·</span>
          <button onClick={handleJsonImportClick} className="btn-ghost">
            JSON 복원
          </button>
        </footer>
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {showUpload && <PhotoUploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}

function PhotoThumb({ photo }: { photo: Blob }) {
  const url = URL.createObjectURL(photo);
  return (
    <img
      src={url}
      alt="베이스 사진"
      className="w-14 h-14 object-cover rounded-lg ring-1 ring-ink-100/60"
      onLoad={() => URL.revokeObjectURL(url)}
    />
  );
}
