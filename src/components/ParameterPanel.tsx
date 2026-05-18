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
  pinnedTabIds,
  onPinToggle,
  children,
}: ParameterPanelProps) {
  return (
    <div className="flex h-full">
      {/* Vertical tab strip */}
      <div className="flex flex-col border-r border-gray-200 bg-gray-50 min-w-[56px]">
        {tabs.map((tab) => {
          const isPinned = pinnedTabIds?.includes(tab.id) ?? false;
          return (
            <div key={tab.id} className="relative group">
              <button
                onClick={() => onActiveChange(tab.id)}
                className={[
                  'w-full px-2 py-3 text-xs font-medium text-center transition-colors',
                  tab.id === activeId
                    ? 'bg-white text-blue-600 border-r-2 border-blue-600 -mr-px'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
                ].join(' ')}
                aria-pressed={tab.id === activeId}
                data-tab={tab.id}
              >
                {isPinned && (
                  <span className="block text-yellow-400 text-[8px] leading-none mb-0.5">★</span>
                )}
                {tab.label}
              </button>
              {onPinToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinToggle(tab.id);
                  }}
                  className="absolute top-1 right-0.5 opacity-0 group-hover:opacity-100 text-[9px] text-gray-400 hover:text-yellow-500 transition-opacity leading-none"
                  aria-label={isPinned ? `${tab.label} 고정 해제` : `${tab.label} 고정`}
                  title={isPinned ? '고정 해제' : '고정'}
                >
                  {isPinned ? '★' : '☆'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {children}
      </div>
    </div>
  );
}
