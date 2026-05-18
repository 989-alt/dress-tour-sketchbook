import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls fn after the delay', () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d('hello');
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('hello');
  });

  it('collapses multiple rapid calls — fn called only once', () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d('a');
    d('b');
    d('c');
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('cancel prevents the pending call', () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d('x');
    d.cancel();
    vi.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush fires immediately with the last args', () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d('flush-me');
    d.flush();
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('flush-me');
    // timer should be cleared — no second call
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('flush does nothing when no pending call', () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d.flush();
    expect(fn).not.toHaveBeenCalled();
  });

  it('can be called again after flush', () => {
    const fn = vi.fn();
    const d = debounce(fn, 300);
    d('first');
    d.flush();
    d('second');
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(2, 'second');
  });
});
