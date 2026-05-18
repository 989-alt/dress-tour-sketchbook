import type { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface ParameterPanelProps {
  tabs: Tab[];
  activeId: string;
  onActiveChange: (id: string) => void;
  children: ReactNode;
}

export function ParameterPanel({ tabs, activeId, onActiveChange, children }: ParameterPanelProps) {
  return (
    <div className="flex h-full">
      {/* Vertical tab strip */}
      <div className="flex flex-col border-r border-gray-200 bg-gray-50 min-w-[56px]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onActiveChange(tab.id)}
            className={[
              'px-2 py-3 text-xs font-medium text-center transition-colors',
              tab.id === activeId
                ? 'bg-white text-blue-600 border-r-2 border-blue-600 -mr-px'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
            ].join(' ')}
            aria-pressed={tab.id === activeId}
            data-tab={tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </div>
  );
}
