import type { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface ParameterPanelProps {
  tabs: Tab[];
  activeId: string;
  onActiveChange: (id: string) => void;
  pinnedTabIds?: string[];
  onPinToggle?: (id: string) => void;
  children: ReactNode;
}

export function ParameterPanel({
  tabs,
  activeId,
  onActiveChange,
  children,
}: ParameterPanelProps) {
  return (
    <div className="flex flex-col">
      {/* Horizontal tab chip row */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onActiveChange(tab.id)}
            aria-pressed={tab.id === activeId}
            data-tab={tab.id}
            className={[
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              tab.id === activeId
                ? 'text-white shadow-paper'
                : 'bg-white border border-ink-100/60 text-ink-400 hover:border-ink-100 hover:text-ink-900',
            ].join(' ')}
            style={tab.id === activeId ? { backgroundImage: 'linear-gradient(135deg, #C25A4C 0%, #8A5970 100%)' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}
