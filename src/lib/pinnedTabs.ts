const KEY = 'pinned-tabs';

export function getPinnedTabs(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function togglePinnedTab(id: string): void {
  const current = getPinnedTabs();
  const next = current.includes(id)
    ? current.filter((t) => t !== id)
    : [...current, id];
  localStorage.setItem(KEY, JSON.stringify(next));
}
