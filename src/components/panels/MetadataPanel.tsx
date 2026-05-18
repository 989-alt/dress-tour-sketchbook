import type { DressEntry } from '../../types';

type MetaFields = Pick<DressEntry, 'categorical' | 'quotes' | 'ratings' | 'pros' | 'cons'>;

interface MetadataPanelProps {
  entry: MetaFields;
  onChange: (patch: Partial<MetaFields>) => void;
}

const CATEGORICAL_OPTIONS = {
  necklineNotes: ['깊다', '얕다', '레이스 트림 있음', '비즈 디테일'],
  sleeveNotes: ['민소매', '짧음', '시스루', '레이스'],
  backNotes: ['오픈백', '버튼 있음', '레이스업', '드레이프'],
  fabricNotes: ['새틴', '튤', '레이스', '시폰'],
  trainNotes: ['짧음', '중간', '길음', '대성당'],
} as const;

const CATEGORICAL_LABELS: Record<keyof typeof CATEGORICAL_OPTIONS, string> = {
  necklineNotes: '네크라인',
  sleeveNotes: '소매',
  backNotes: '등',
  fabricNotes: '소재',
  trainNotes: '트레인',
};

const RATING_LABELS: Array<{ key: keyof DressEntry['ratings']; label: string }> = [
  { key: 'firstImpression', label: '첫인상' },
  { key: 'fit', label: '피팅' },
  { key: 'comfort', label: '편안함' },
  { key: 'weddingFeel', label: '웨딩 느낌' },
];

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function MetadataPanel({ entry, onChange }: MetadataPanelProps) {
  const inputCls = 'w-full bg-cream-50 border border-ink-100/60 rounded-xl px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200';

  return (
    <div className="space-y-5">
      {/* Categorical checkboxes */}
      {(Object.keys(CATEGORICAL_OPTIONS) as Array<keyof typeof CATEGORICAL_OPTIONS>).map((key) => (
        <div key={key}>
          <p className="label-caps mb-1">{CATEGORICAL_LABELS[key]}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {CATEGORICAL_OPTIONS[key].map((opt) => (
              <label key={opt} className="flex items-center gap-1 text-sm text-ink-900 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-rose-500"
                  checked={entry.categorical[key].includes(opt)}
                  onChange={() =>
                    onChange({
                      categorical: {
                        ...entry.categorical,
                        [key]: toggleItem(entry.categorical[key], opt),
                      },
                    })
                  }
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Quotes */}
      <div>
        <p className="label-caps mb-1">신부 코멘트</p>
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={entry.quotes.bride}
          onChange={(e) => onChange({ quotes: { ...entry.quotes, bride: e.target.value } })}
          placeholder="신부 소감"
        />
      </div>
      <div>
        <p className="label-caps mb-1">신랑 코멘트</p>
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={entry.quotes.groom}
          onChange={(e) => onChange({ quotes: { ...entry.quotes, groom: e.target.value } })}
          placeholder="신랑 소감"
        />
      </div>

      {/* Ratings */}
      <div>
        <p className="label-caps mb-2">별점</p>
        <div className="space-y-2">
          {RATING_LABELS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-ink-400 w-20">{label}</span>
              <div className="flex gap-1">
                {([1, 2, 3, 4, 5] as const).map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      onChange({ ratings: { ...entry.ratings, [key]: star } })
                    }
                    aria-label={`${label} ${star}점`}
                    className={[
                      'w-6 h-6 text-sm rounded',
                      entry.ratings[key] >= star ? 'text-gold' : 'text-ink-100',
                    ].join(' ')}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pros */}
      <div>
        <p className="label-caps mb-1">장점</p>
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="text"
              className={inputCls}
              value={entry.pros[i] ?? ''}
              onChange={(e) => {
                const next = [...entry.pros];
                next[i] = e.target.value;
                onChange({ pros: next });
              }}
              placeholder={`장점 ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Cons */}
      <div>
        <p className="label-caps mb-1">단점</p>
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="text"
              className={inputCls}
              value={entry.cons[i] ?? ''}
              onChange={(e) => {
                const next = [...entry.cons];
                next[i] = e.target.value;
                onChange({ cons: next });
              }}
              placeholder={`단점 ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
