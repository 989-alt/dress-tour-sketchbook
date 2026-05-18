import { openDB, type IDBPDatabase } from 'idb';
import type { AppMeta, DressEntry } from '../types';

const DB_NAME = 'dress-tour-sketchbook';
const DB_VERSION = 1;
const META_STORE = 'meta';
const ENTRIES_STORE = 'entries';
const META_KEY = 'singleton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- idb schema is typed via generics but we keep it simple here
type DB = IDBPDatabase<any>;

let dbPromise: Promise<DB> | null = null;

function getDb(): Promise<DB> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE);
        }
        if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
          const store = db.createObjectStore(ENTRIES_STORE, { keyPath: 'id' });
          store.createIndex('by-createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function getMeta(): Promise<AppMeta | undefined> {
  const db = await getDb();
  return db.get(META_STORE, META_KEY) as Promise<AppMeta | undefined>;
}

export async function setMeta(meta: AppMeta): Promise<void> {
  const db = await getDb();
  await db.put(META_STORE, meta, META_KEY);
}

export async function clearMeta(): Promise<void> {
  const db = await getDb();
  await db.delete(META_STORE, META_KEY);
}

export async function listEntries(): Promise<DressEntry[]> {
  const db = await getDb();
  // Use the index to get all entries sorted by createdAt ascending, then reverse for desc
  const entries = (await db.getAllFromIndex(ENTRIES_STORE, 'by-createdAt')) as DressEntry[];
  return [...entries].reverse();
}

export async function getEntry(id: string): Promise<DressEntry | undefined> {
  const db = await getDb();
  return db.get(ENTRIES_STORE, id) as Promise<DressEntry | undefined>;
}

export async function upsertEntry(entry: DressEntry): Promise<void> {
  const db = await getDb();
  await db.put(ENTRIES_STORE, entry);
}

export async function removeEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(ENTRIES_STORE, id);
}

/**
 * Clears all object stores AND drops the cached DB connection so that
 * subsequent operations reopen the database from scratch. This double
 * reset is intentional: test suites rely on it for full isolation
 * (each test gets a clean DB), and it also ensures production callers
 * that invoke clearAll see a consistent empty state on the next open.
 */
export async function clearAll(): Promise<void> {
  const db = await getDb();
  await db.clear(META_STORE);
  await db.clear(ENTRIES_STORE);
  // Reset the memoized connection so tests get a fresh state
  dbPromise = null;
}
