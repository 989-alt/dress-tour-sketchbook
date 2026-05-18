import type { DressEntry } from '../../types';

type BasicFields = Pick<DressEntry, 'nickname' | 'shop' | 'dressNo' | 'lightingNote'>;

interface BasicPanelProps {
  entry: BasicFields;
  onChange: (patch: Partial<BasicFields>) => void;
}

export function BasicPanel({ entry, onChange }: BasicPanelProps) {
  const inputCls = 'w-full bg-cream-50 border border-ink-100/60 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200';

  return (
    <div className="space-y-4">
      <div>
        <label className="block label-caps mb-1">별명</label>
        <input
          type="text"
          className={inputCls}
          value={entry.nickname}
          onChange={(e) => onChange({ nickname: e.target.value })}
          placeholder="드레스 별명"
        />
      </div>
      <div>
        <label className="block label-caps mb-1">매장</label>
        <input
          type="text"
          className={inputCls}
          value={entry.shop}
          onChange={(e) => onChange({ shop: e.target.value })}
          placeholder="매장 이름"
        />
      </div>
      <div>
        <label className="block label-caps mb-1">드레스#</label>
        <input
          type="text"
          className={inputCls}
          value={entry.dressNo}
          onChange={(e) => onChange({ dressNo: e.target.value })}
          placeholder="드레스 번호"
        />
      </div>
      <div>
        <label className="block label-caps mb-1">조명 메모</label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          value={entry.lightingNote}
          onChange={(e) => onChange({ lightingNote: e.target.value })}
          placeholder="조명 상태 메모"
        />
      </div>
    </div>
  );
}
