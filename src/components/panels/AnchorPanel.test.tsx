import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnchorPanel } from './AnchorPanel';

describe('AnchorPanel', () => {
  it('renders the manual mode toggle button', () => {
    render(
      <AnchorPanel
        manualMode={false}
        onManualModeChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByTestId('manual-mode-toggle')).toBeInTheDocument();
  });

  it('toggle shows 자동 when manualMode is false', () => {
    render(
      <AnchorPanel
        manualMode={false}
        onManualModeChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByTestId('manual-mode-toggle')).toHaveTextContent('자동');
  });

  it('toggle shows 수동 when manualMode is true', () => {
    render(
      <AnchorPanel
        manualMode={true}
        onManualModeChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByTestId('manual-mode-toggle')).toHaveTextContent('수동');
  });

  it('clicking toggle calls onManualModeChange with flipped value', () => {
    const onChange = vi.fn();
    render(
      <AnchorPanel
        manualMode={false}
        onManualModeChange={onChange}
        onReset={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('manual-mode-toggle'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders 앵커 재설정 and 포즈 재검출 buttons', () => {
    render(
      <AnchorPanel
        manualMode={false}
        onManualModeChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByText('앵커 재설정')).toBeInTheDocument();
    expect(screen.getByText('포즈 재검출')).toBeInTheDocument();
  });

  it('포즈 재검출 is disabled when onRedetect is not provided', () => {
    render(
      <AnchorPanel
        manualMode={false}
        onManualModeChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByText('포즈 재검출')).toBeDisabled();
  });
});
