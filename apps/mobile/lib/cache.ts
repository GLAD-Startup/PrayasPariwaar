import AsyncStorage from "@react-native-async-storage/async-storage";

// Two-tier cache system:
// Tier 1: High-speed RAM Memory Map (0ms synchronous-speed reads)
// Tier 2: Persistent Async Storage Disk Cache (preserves data across app closes and cold launches)

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEnvelope<any>>();
const CACHE_PREFIX = "prayas_cache_";
let isAsyncStorageWorking = true;

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

  if (!isAsyncStorageWorking) {
    return null;
  }

  // 2. Tier 2: Persistent Disk Storage (survives app restarts)
  try {
    const stored = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;

    const diskEnvelope: CacheEnvelope<T> = JSON.parse(stored);
    if (!diskEnvelope || !diskEnvelope.timestamp) return null;

    if (Date.now() - diskEnvelope.timestamp > maxAgeMs) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key).catch(() => {});
      return null;
    }

    // Populate RAM cache for subsequent instant reads
    memoryCache.set(key, diskEnvelope);
    return diskEnvelope.data;
  } catch (error) {
    // If native AsyncStorage module is missing or throws, fallback to RAM cache silently
    isAsyncStorageWorking = false;
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

  if (!isAsyncStorageWorking) return;

  // Persist to Disk asynchronously
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(envelope));
  } catch (error) {
    isAsyncStorageWorking = false;
  }
}

/**
 * Clear a cached key from both RAM and Disk
 */
export async function clearCachedData(key: string): Promise<void> {
  memoryCache.delete(key);

  if (!isAsyncStorageWorking) return;

  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    isAsyncStorageWorking = false;
  }
}

