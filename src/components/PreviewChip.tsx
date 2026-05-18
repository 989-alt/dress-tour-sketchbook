import type { ReactNode, ReactElement } from 'react';

export interface PreviewChipProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
  previewSrc?: string;
  svgFallback?: ReactNode;
  disabled?: boolean;
  /** Extra data-* attributes for tests (e.g. { 'data-silhouette': 'aline' }) */
  dataAttrs?: Record<string, string>;
}

export function PreviewChip({
  selected,
  onClick,
  label,
  description,
  previewSrc,
  svgFallback,
  disabled,
  dataAttrs,
}: PreviewChipProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...dataAttrs}
      className={[
        'flex flex-col items-stretch gap-1 p-2 rounded border transition-colors text-left',
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:bg-gray-50',
      ].join(' ')}
    >
      {(svgFallback || previewSrc) && (
        <div className="relative aspect-[4/5] bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          {svgFallback && (
            <div className="absolute inset-0 flex items-center justify-center">
              {svgFallback}
            </div>
          )}
          {previewSrc && (
            <img
              src={previewSrc}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>
      )}
      <div>
        <div className="font-medium text-xs text-gray-700">{label}</div>
        <div className="text-xs text-gray-500 leading-tight">{description}</div>
      </div>
    </button>
  );
}
