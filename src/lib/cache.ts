/**
 * Centralized Production Memory Cache Service
 * Provides TTL-based in-memory caching with invalidation triggers and hit/miss statistics.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = { hits: 0, misses: 0, evictions: 0 };

  /**
   * Get item from cache or null if missing/expired.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Set cache key with custom or default TTL (in ms).
   */
  set<T>(key: string, data: T, ttlMs = 5000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Invalidate specific key or prefix
   */
  invalidate(keyOrPrefix: string): void {
    if (this.cache.has(keyOrPrefix)) {
      this.cache.delete(keyOrPrefix);
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache metrics for health checks
   */
  getStats() {
    return {
      size: this.cache.size,
      ...this.stats,
    };
  }
}

export const productionCache = new MemoryCache();

// Legacy backward-compatibility object
export const memoryCache = {
  leaderboard: { data: null as any, lastTime: 0 },
  systemSettings: { data: null as any, lastTime: 0 },
  events: { data: null as any, lastTime: 0 },
};

export const CACHE_TTL = 5000;
