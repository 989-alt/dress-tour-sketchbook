import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BasicPanel } from './BasicPanel';

const DEFAULT_ENTRY = {
  nickname: '',
  shop: '',
  dressNo: '',
  lightingNote: '',
};

describe('BasicPanel', () => {
  it('renders all four input fields', () => {
    render(<BasicPanel entry={DEFAULT_ENTRY} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('드레스 별명')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('매장 이름')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('드레스 번호')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('조명 상태 메모')).toBeInTheDocument();
  });

  it('calls onChange with nickname patch when nickname input changes', () => {
    const onChange = vi.fn();
    render(<BasicPanel entry={DEFAULT_ENTRY} onChange={onChange} />);
    const input = screen.getByPlaceholderText('드레스 별명');
    fireEvent.change(input, { target: { value: '흰 드레스' } });
    expect(onChange).toHaveBeenCalledWith({ nickname: '흰 드레스' });
  });

  it('calls onChange with shop patch when shop input changes', () => {
    const onChange = vi.fn();
    render(<BasicPanel entry={DEFAULT_ENTRY} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('매장 이름'), { target: { value: '한국웨딩' } });
    expect(onChange).toHaveBeenCalledWith({ shop: '한국웨딩' });
  });

  it('calls onChange with lightingNote patch when textarea changes', () => {
    const onChange = vi.fn();
    render(<BasicPanel entry={DEFAULT_ENTRY} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('조명 상태 메모'), { target: { value: '밝음' } });
    expect(onChange).toHaveBeenCalledWith({ lightingNote: '밝음' });
  });
});
