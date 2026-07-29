import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Token bucket rate limiting configuration
interface Bucket {
  tokens: number;
  lastRefill: number;
}

// In-memory store for client IP buckets
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

  // Determine rate limit bucket size and refill rate based on route sensitivity
  const isSensitive = path.includes('/api/auth/') || path.includes('/api/events/score') || path.includes('/api/valuation/');
  const maxTokens = isSensitive ? 10 : 60; // Max requests allowed in the bucket
  const refillInterval = 60 * 1000; // Refill window (1 minute)

  const now = Date.now();
  let bucket = ipBuckets.get(ip);

  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now };
    ipBuckets.set(ip, bucket);
  }

  // Calculate elapsed time and add tokens proportionally
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor((elapsed / refillInterval) * maxTokens);
  
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  // Capping the in-memory map size to prevent heap exhaustion
  if (ipBuckets.size > 10000) {
    // Evict a random entry if map grows too large
    const firstKey = ipBuckets.keys().next().value;
    if (firstKey) ipBuckets.delete(firstKey);
  }

  if (bucket.tokens <= 0) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Too many requests. Please slow down and try again later.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    );
  }

  // Consume 1 token
  bucket.tokens -= 1;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
