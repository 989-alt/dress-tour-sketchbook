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
    // Reset so same file can be re-imported
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <h1 className="text-lg font-bold text-gray-800">드레스 투어 스케치북</h1>
      </header>

      <main className="flex-1 overflow-auto px-4 py-4 space-y-5">
        {/* Base photo section */}
        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">베이스 사진</p>
          {!hasPhoto ? (
            <button
              onClick={() => setShowUpload(true)}
              className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50"
            >
              베이스 사진 업로드 + 포즈 검출
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <PhotoThumb photo={meta!.basePhoto!} />
              <button
                onClick={() => setShowUpload(true)}
                className="text-sm text-indigo-600 hover:underline"
              >
                사진 변경
              </button>
            </div>
          )}
        </section>

        {/* Add dress button */}
        <button
          onClick={() => navigate('/new')}
          disabled={!hasPhoto}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl text-base font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + 새 드레스 추가
        </button>

        {/* Entry grid */}
        {entries.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
              내 드레스 ({entries.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => navigate(`/edit/${entry.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-around px-4 py-3 bg-white border-t border-gray-200 shrink-0">
        <button
          onClick={() => navigate('/summary')}
          className="text-sm text-indigo-600 font-medium hover:underline"
        >
          요약 보기
        </button>
        <button
          onClick={handleJsonExport}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          JSON 받기
        </button>
        <button
          onClick={handleJsonImportClick}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          JSON 복원
        </button>
      </footer>

      {/* Hidden file input for JSON import */}
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
      className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-gray-100"
      onLoad={() => URL.revokeObjectURL(url)}
    />
  );
}
