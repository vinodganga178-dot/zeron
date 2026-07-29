import { NextResponse } from 'next/server';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase-admin';
import { isFirebaseActive } from '@/lib/firebase';

export async function GET() {
  const timestamp = new Date().toISOString();
  const dbHealth: { status: string; latency?: string; error?: string } = { status: 'unknown' };

  if (isFirebaseActive && isAdminConfigured()) {
    try {
      const db = getAdminDb();
      const start = Date.now();
      // Perform a minimal, low-cost read to verify connection health
      await db.collection('events').limit(1).get();
      const latency = Date.now() - start;
      dbHealth.status = 'connected';
      dbHealth.latency = `${latency}ms`;
    } catch (error: any) {
      dbHealth.status = 'error';
      dbHealth.error = error.message || 'Firestore connection failed';
    }
  } else {
    // Local Sandbox Mode
    dbHealth.status = 'connected';
    dbHealth.latency = 'sandbox_local';
  }

  // Get system memory statistics
  const memoryUsage = process.memoryUsage();
  const memoryStats = {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
  };

  const isHealthy = dbHealth.status !== 'error';

  return NextResponse.json(
    {
      success: true,
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      services: {
        database: dbHealth,
        environment: process.env.NODE_ENV || 'production',
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
