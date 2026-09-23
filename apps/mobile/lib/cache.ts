// Resilient Two-tier cache system:
// Tier 1: Instant RAM Memory Map (0ms synchronous-speed reads, 100% resilient across any runtime)
// Tier 2: Guarded Persistent Disk Storage (survives app reloads if native storage module is present)

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEnvelope<any>>();
const CACHE_PREFIX = "prayas_cache_";

// Safely obtain native storage without crashing Hermes during module evaluation
let persistentStorage: {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
} | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("@react-native-async-storage/async-storage");
  const storage = mod?.default || mod;
  if (storage && typeof storage.getItem === "function") {
    persistentStorage = storage;
  }
} catch {
  persistentStorage = null;
}

/**
 * Get cached data: Checks RAM memory first (0ms), then falls back to persistent Disk Storage
 * @param key Storage key
 * @param maxAgeMs Optional expiration in milliseconds (default: 7 days)
 */
export async function getCachedData<T>(
  key: string,
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000
): Promise<T | null> {
  // 1. Tier 1: In-memory RAM cache (instant 0ms)
  const memEnvelope = memoryCache.get(key);
  if (memEnvelope && memEnvelope.timestamp) {
    if (Date.now() - memEnvelope.timestamp <= maxAgeMs) {
      return memEnvelope.data as T;
    }
    memoryCache.delete(key);
  }

  if (!persistentStorage) {
    return null;
  }

  // 2. Tier 2: Persistent Disk Storage (survives app restarts)
  try {
    const stored = await persistentStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;

    const diskEnvelope: CacheEnvelope<T> = JSON.parse(stored);
    if (!diskEnvelope || !diskEnvelope.timestamp) return null;

    if (Date.now() - diskEnvelope.timestamp > maxAgeMs) {
      await persistentStorage.removeItem(CACHE_PREFIX + key).catch(() => {});
      return null;
    }

    // Populate RAM cache for subsequent instant reads
    memoryCache.set(key, diskEnvelope);
    return diskEnvelope.data;
  } catch {
    return null;
  }
}

/**
 * Save data to both in-memory RAM cache and persistent Disk Storage
 */
export async function setCachedData<T>(key: string, data: T): Promise<void> {
  const envelope: CacheEnvelope<T> = {
    data,
    timestamp: Date.now(),
  };

  // Always save to RAM
  memoryCache.set(key, envelope);

  if (!persistentStorage) return;

  // Persist to Disk asynchronously
  try {
    await persistentStorage.setItem(CACHE_PREFIX + key, JSON.stringify(envelope));
  } catch {
    // Graceful fallback to in-memory only
  }
}

/**
 * Clear a cached key from both RAM and Disk
 */
export async function clearCachedData(key: string): Promise<void> {
  memoryCache.delete(key);

  if (!persistentStorage) return;

  try {
    await persistentStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // Ignore
  }
}
