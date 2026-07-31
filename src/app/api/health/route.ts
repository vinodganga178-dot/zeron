import { NextResponse } from 'next/server';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase-admin';
import { isFirebaseActive } from '@/lib/firebase';
import { productionCache } from '@/lib/cache';
import { getEnvConfig } from '@/lib/env';

export async function GET() {
  const timestamp = new Date().toISOString();
  const dbHealth: { status: string; latency?: string; error?: string } = { status: 'unknown' };

  if (isFirebaseActive && isAdminConfigured()) {
    try {
      const db = getAdminDb();
      if (db) {
        const start = Date.now();
        await db.collection('events').limit(1).get();
        const latency = Date.now() - start;
        dbHealth.status = 'connected';
        dbHealth.latency = `${latency}ms`;
      }
    } catch (error: any) {
      dbHealth.status = 'error';
      dbHealth.error = error.message || 'Firestore connection failed';
    }
  } else {
    // Local / High-Performance Standalone Memory Store Mode
    dbHealth.status = 'connected';
    dbHealth.latency = '0ms (standalone_in_memory)';
  }

  const memoryUsage = process.memoryUsage();
  const memoryStats = {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
  };

  const cacheStats = productionCache.getStats();
  const envConfig = getEnvConfig();
  const isHealthy = dbHealth.status !== 'error';

  return NextResponse.json(
    {
      success: true,
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      services: {
        database: dbHealth,
        cache: cacheStats,
        environment: envConfig.nodeEnv,
      },
      system: {
        memory: memoryStats,
        uptime: `${Math.round(process.uptime())}s`,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

export const dynamic = 'force-dynamic';
