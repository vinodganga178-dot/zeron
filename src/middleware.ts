import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const ipBuckets = new Map<string, Bucket>();

// Memory leak protection: clean up buckets older than 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of ipBuckets.entries()) {
    if (now - bucket.lastRefill > 10 * 60 * 1000) {
      ipBuckets.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Exclude healthcheck from strict rate limits
  if (path === '/api/health') {
    return NextResponse.next();
  }

  // Get client IP address
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

  // Determine rate limit tier based on route sensitivity
  let maxTokens = 60; // Default read limit: 60 req/min
  let refillIntervalMs = 60 * 1000;

  if (path.includes('/api/auth/')) {
    maxTokens = 10; // Strict limit on Auth endpoints
  } else if (path.includes('/score') || path.includes('/admin/') || path.includes('/system/')) {
    maxTokens = 30; // Sensitive write operations
  } else if (path.includes('/leaderboard') || path.includes('/events')) {
    maxTokens = 120; // High-throughput public reads
  }

  const now = Date.now();
  let bucket = ipBuckets.get(ip);

  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now };
    ipBuckets.set(ip, bucket);
  }

  // Calculate elapsed time and add tokens proportionally
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor((elapsed / refillIntervalMs) * maxTokens);

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  // Cap memory size to prevent heap exhaustion
  if (ipBuckets.size > 10000) {
    const firstKey = ipBuckets.keys().next().value;
    if (firstKey) ipBuckets.delete(firstKey);
  }

  if (bucket.tokens <= 0) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Rate limit exceeded. Please slow down and try again shortly.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Limit': maxTokens.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // Consume 1 token
  bucket.tokens -= 1;

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', maxTokens.toString());
  response.headers.set('X-RateLimit-Remaining', bucket.tokens.toString());

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
