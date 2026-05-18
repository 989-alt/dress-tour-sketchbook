import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewChip } from './PreviewChip';

describe('PreviewChip', () => {
  it('renders label', () => {
    render(
      <PreviewChip selected={false} onClick={() => {}} label="A-라인" description="아래로 퍼짐" />,
    );
    expect(screen.getByText('A-라인')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <PreviewChip selected={false} onClick={() => {}} label="A-라인" description="아래로 퍼짐" />,
    );
    expect(screen.getByText('아래로 퍼짐')).toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <PreviewChip selected={false} onClick={onClick} label="머메이드" description="무릎부터 퍼짐" />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <PreviewChip selected={false} onClick={onClick} label="시스" description="직선형" disabled />,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('applies selected border class when selected=true', () => {
    const { container } = render(
      <PreviewChip selected={true} onClick={() => {}} label="시스" description="직선형" />,
    );
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('border-rose-400');
  });

  it('applies unselected border class when selected=false', () => {
    const { container } = render(
      <PreviewChip selected={false} onClick={() => {}} label="시스" description="직선형" />,
    );
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('border-ink-100/60');
  });

  it('renders img when previewSrc is provided', () => {
    render(
      <PreviewChip
        selected={false}
        onClick={() => {}}
        label="A-라인"
        description="아래로 퍼짐"
        previewSrc="/previews/silhouette/aline.png"
      />,
    );
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/previews/silhouette/aline.png');
  });

  it('hides img on error (onError sets display:none)', () => {
    render(
      <PreviewChip
        selected={false}
        onClick={() => {}}
        label="A-라인"
        description="아래로 퍼짐"
        previewSrc="/previews/silhouette/aline.png"
      />,
    );
    const img = screen.getByRole<HTMLImageElement>('img');
    fireEvent.error(img);
    expect(img.style.display).toBe('none');
  });

  it('renders svgFallback when provided', () => {
    render(
      <PreviewChip
        selected={false}
        onClick={() => {}}
        label="A-라인"
        description="아래로 퍼짐"
        svgFallback={<svg data-testid="fallback-svg" />}
      />,
    );
    expect(screen.getByTestId('fallback-svg')).toBeInTheDocument();
  });

  it('spreads dataAttrs onto button', () => {
    render(
      <PreviewChip
        selected={false}
        onClick={() => {}}
        label="A-라인"
        description="아래로 퍼짐"
        dataAttrs={{ 'data-silhouette': 'aline' }}
      />,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-silhouette', 'aline');
  });
});
