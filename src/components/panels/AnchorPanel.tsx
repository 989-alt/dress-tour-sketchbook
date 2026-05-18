interface AnchorPanelProps {
  manualMode: boolean;
  onManualModeChange: (next: boolean) => void;
  onReset: () => void;
  onRedetect?: () => void;
}

export function AnchorPanel({ manualMode, onManualModeChange, onReset, onRedetect }: AnchorPanelProps) {
  return (
    <div className="space-y-4">
      {/* Auto / Manual toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">모드</span>
        <button
          onClick={() => onManualModeChange(!manualMode)}
          className={[
            'px-3 py-1 rounded text-sm font-medium transition-colors',
            manualMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ].join(' ')}
          aria-pressed={manualMode}
          data-testid="manual-mode-toggle"
        >
          {manualMode ? '수동' : '자동'}
        </button>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          onClick={onReset}
          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
        >
          앵커 재설정
        </button>
        <button
          onClick={onRedetect}
          disabled={!onRedetect}
          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          포즈 재검출
        </button>
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500 leading-relaxed">
        자동 모드에서는 감지된 모든 앵커를 드래그할 수 있습니다.
        수동 모드에서는 어깨·허리·밑단 5개 앵커만 조정합니다.
        드레스 실루엣을 정확히 맞추려면 앵커를 드래그하세요.
      </p>
    </div>
  );
}
