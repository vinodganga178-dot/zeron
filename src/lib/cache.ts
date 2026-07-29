/**
 * Centralized memory cache helper.
 * Since Next.js API routes run in the same Node.js process, they share this module.
 */

export const memoryCache = {
  leaderboard: { data: null as any, lastTime: 0 },
  systemSettings: { data: null as any, lastTime: 0 },
  events: { data: null as any, lastTime: 0 }
};

export const CACHE_TTL = 5000; // 5 seconds
