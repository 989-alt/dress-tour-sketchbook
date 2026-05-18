import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWakeLock } from './wakeLock';

// Minimal WakeLockSentinel mock
function makeSentinel() {
  const sentinel = {
    released: false,
    release: vi.fn(async () => { sentinel.released = true; }),
  };
  return sentinel;
}

describe('useWakeLock', () => {
  let requestMock: ReturnType<typeof vi.fn>;
  let sentinel: ReturnType<typeof makeSentinel>;

  beforeEach(() => {
    sentinel = makeSentinel();
    requestMock = vi.fn(async () => sentinel);
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: requestMock },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Remove the mock so next test starts clean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).wakeLock;
  });

  it('requests wake lock when active=true', async () => {
    const { result } = renderHook(() => useWakeLock(true));
    // Give the async request time to resolve
    await act(async () => {});
    void result; // hook returns void
    expect(requestMock).toHaveBeenCalledWith('screen');
  });

  it('does NOT request wake lock when active=false', async () => {
    renderHook(() => useWakeLock(false));
    await act(async () => {});
    expect(requestMock).not.toHaveBeenCalled();
  });

  it('releases wake lock on unmount', async () => {
    const { unmount } = renderHook(() => useWakeLock(true));
    await act(async () => {});
    expect(requestMock).toHaveBeenCalledTimes(1);
    unmount();
    await act(async () => {});
    expect(sentinel.release).toHaveBeenCalled();
  });

  it('does nothing when wakeLock API is not available', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).wakeLock;
    // Should not throw
    const { unmount } = renderHook(() => useWakeLock(true));
    await act(async () => {});
    unmount();
    // No assertion needed — just must not throw
  });

  it('transitions from active=false to active=true acquires lock', async () => {
    const { rerender } = renderHook(({ active }) => useWakeLock(active), {
      initialProps: { active: false },
    });
    await act(async () => {});
    expect(requestMock).not.toHaveBeenCalled();

    rerender({ active: true });
    await act(async () => {});
    expect(requestMock).toHaveBeenCalledWith('screen');
  });
});
