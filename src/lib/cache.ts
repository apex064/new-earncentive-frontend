/**
 * Client-side cache utility with 5-minute TTL
 * Prevents multiple backend requests within the same 5-minute window
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache storage
const cacheStorage: Map<string, CacheEntry<any>> = new Map();

/**
 * Get cached data if available and not expired
 * @param key - Cache key
 * @returns Cached data or null if expired/not found
 */
export function getCachedData<T>(key: string): T | null {
  const entry = cacheStorage.get(key);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  const age = now - entry.timestamp;
  
  // Check if cache is still valid (less than 5 minutes old)
  if (age < CACHE_DURATION) {
    console.log(`[Cache Hit] ${key} (age: ${Math.round(age / 1000)}s)`);
    return entry.data as T;
  }
  
  // Cache expired, remove it
  cacheStorage.delete(key);
  console.log(`[Cache Expired] ${key}`);
  return null;
}

/**
 * Set cached data
 * @param key - Cache key
 * @param data - Data to cache
 */
export function setCachedData<T>(key: string, data: T): void {
  cacheStorage.set(key, {
    data,
    timestamp: Date.now(),
  });
  console.log(`[Cache Set] ${key}`);
}

/**
 * Clear specific cache entry
 * @param key - Cache key to clear
 */
export function clearCache(key: string): void {
  cacheStorage.delete(key);
  console.log(`[Cache Cleared] ${key}`);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  cacheStorage.clear();
  console.log(`[Cache Cleared All]`);
}

/**
 * Check if cache is still valid without returning data
 * @param key - Cache key
 * @returns true if cache exists and is valid
 */
export function isCacheValid(key: string): boolean {
  const entry = cacheStorage.get(key);
  
  if (!entry) {
    return false;
  }
  
  const now = Date.now();
  const age = now - entry.timestamp;
  
  return age < CACHE_DURATION;
}

/**
 * Get time remaining for cache (in milliseconds)
 * @param key - Cache key
 * @returns Milliseconds until cache expires, or 0 if no valid cache
 */
export function getCacheTimeRemaining(key: string): number {
  const entry = cacheStorage.get(key);
  
  if (!entry) {
    return 0;
  }
  
  const now = Date.now();
  const age = now - entry.timestamp;
  const remaining = CACHE_DURATION - age;
  
  return remaining > 0 ? remaining : 0;
}
