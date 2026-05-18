import { create } from 'zustand';
import type { AppMeta, DressEntry } from '../types';
import * as db from '../lib/db';

interface AppStore {
  meta: AppMeta | null;
  entries: DressEntry[];
  hydrated: boolean;

  hydrate(): Promise<void>;

  setMeta(meta: AppMeta | null): Promise<void>;
  upsertEntry(entry: DressEntry): Promise<void>;
  removeEntry(id: string): Promise<void>;
}

let hydratePromise: Promise<void> | null = null;

export const useAppStore = create<AppStore>((set, get) => ({
  meta: null,
  entries: [],
  hydrated: false,

  hydrate(): Promise<void> {
    if (get().hydrated) return Promise.resolve();
    if (!hydratePromise) {
      hydratePromise = Promise.all([db.getMeta(), db.listEntries()])
        .then(([meta, entries]) => {
          set({ meta: meta ?? null, entries, hydrated: true });
        });
    }
    return hydratePromise;
  },

  async setMeta(meta: AppMeta | null) {
    if (meta === null) {
      await db.clearMeta();
    } else {
      await db.setMeta(meta);
    }
    set({ meta });
  },

  async upsertEntry(entry: DressEntry) {
    await db.upsertEntry(entry);
    set((state) => {
      const existing = state.entries.findIndex((e) => e.id === entry.id);
      const updated =
        existing >= 0
          ? state.entries.map((e) => (e.id === entry.id ? entry : e))
          : [entry, ...state.entries];
      // Keep sorted by createdAt desc
      updated.sort((a, b) => b.createdAt - a.createdAt);
      return { entries: updated };
    });
  },

  async removeEntry(id: string) {
    await db.removeEntry(id);
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },
}));
