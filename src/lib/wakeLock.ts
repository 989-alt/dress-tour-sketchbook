import { useEffect, useRef } from 'react';

// Minimal interface matching the Screen Wake Lock API (WakeLockSentinel)
interface WakeLock {
  release(): Promise<void>;
}

/**
 * Request a screen wake lock while `active` is true.
 * Releases on cleanup or when `active` becomes false.
 * No-op if the Wake Lock API is not supported.
 */
export function useWakeLock(active: boolean): void {
  const lockRef = useRef<WakeLock | null>(null);

  useEffect(() => {
    if (!active) return;
    if (!('wakeLock' in navigator)) return;

    let cancelled = false;

    (navigator as unknown as { wakeLock: { request(type: 'screen'): Promise<WakeLock> } })
      .wakeLock.request('screen').then((sentinel) => {
        if (cancelled) {
          sentinel.release().catch(() => {});
        } else {
          lockRef.current = sentinel;
        }
      }).catch(() => {
        // Acquisition failure is non-fatal (e.g. document hidden)
      });

    return () => {
      cancelled = true;
      if (lockRef.current) {
        lockRef.current.release().catch(() => {});
        lockRef.current = null;
      }
    };
  }, [active]);
}
