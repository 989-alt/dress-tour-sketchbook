import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParameterPanel } from './ParameterPanel';

const TABS = [
  { id: 'basic', label: '기본' },
  { id: 'silhouette', label: '실루엣' },
  { id: 'anchor', label: '앵커' },
  { id: 'pen', label: '펜' },
  { id: 'meta', label: '메모' },
];

describe('ParameterPanel', () => {
  it('renders all five tab buttons', () => {
    render(
      <ParameterPanel tabs={TABS} activeId="basic" onActiveChange={vi.fn()}>
        <div>content</div>
      </ParameterPanel>,
    );
    expect(screen.getByText('기본')).toBeInTheDocument();
    expect(screen.getByText('실루엣')).toBeInTheDocument();
    expect(screen.getByText('앵커')).toBeInTheDocument();
    expect(screen.getByText('펜')).toBeInTheDocument();
    expect(screen.getByText('메모')).toBeInTheDocument();
  });

  it('active tab has aria-pressed=true', () => {
    render(
      <ParameterPanel tabs={TABS} activeId="anchor" onActiveChange={vi.fn()}>
        <div>content</div>
      </ParameterPanel>,
    );
    const anchorBtn = screen.getByText('앵커').closest('button');
    expect(anchorBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('inactive tabs have aria-pressed=false', () => {
    render(
      <ParameterPanel tabs={TABS} activeId="basic" onActiveChange={vi.fn()}>
        <div>content</div>
      </ParameterPanel>,
    );
    const penBtn = screen.getByText('펜').closest('button');
    expect(penBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicking a tab calls onActiveChange with the tab id', () => {
    const onActiveChange = vi.fn();
    render(
      <ParameterPanel tabs={TABS} activeId="basic" onActiveChange={onActiveChange}>
        <div>content</div>
      </ParameterPanel>,
    );
    fireEvent.click(screen.getByText('실루엣'));
    expect(onActiveChange).toHaveBeenCalledWith('silhouette');
  });

  it('renders children (panel content)', () => {
    render(
      <ParameterPanel tabs={TABS} activeId="basic" onActiveChange={vi.fn()}>
        <div data-testid="panel-content">테스트 내용</div>
      </ParameterPanel>,
    );
    expect(screen.getByTestId('panel-content')).toBeInTheDocument();
  });
});
