// In-memory high-speed cache for larger payloads (posts, stories, gallery, lists)
// Avoids the 2048-byte SecureStore limit warning on iOS/Android

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEnvelope<any>>();

/**
 * Get cached data from in-memory session cache
 * @param key Storage key
 * @param maxAgeMs Optional expiration in milliseconds (default: 24 hours)
 */
export async function getCachedData<T>(
  key: string,
  maxAgeMs: number = 24 * 60 * 60 * 1000
): Promise<T | null> {
  try {
    const envelope = memoryCache.get(key);
    if (!envelope || !envelope.timestamp) return null;

    if (Date.now() - envelope.timestamp > maxAgeMs) {
      memoryCache.delete(key);
      return null;
    }

    return envelope.data as T;
  } catch (error) {
    console.log(`[Cache Error] Failed reading ${key}:`, error);
    return null;
  }
}

/**
 * Save data to in-memory session cache
 */
export async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.log(`[Cache Error] Failed writing ${key}:`, error);
  }
}

/**
 * Clear a cached key from in-memory session cache
 */
export async function clearCachedData(key: string): Promise<void> {
  try {
    memoryCache.delete(key);
  } catch (error) {
    console.log(`[Cache Error] Failed clearing ${key}:`, error);
  }
}
