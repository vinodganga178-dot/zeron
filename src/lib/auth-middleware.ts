/**
 * JWT Authentication Middleware
 * Server-side only — used in API routes.
 */

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { SessionPayload } from '@/types/api';
import { getEnvConfig } from './env';

const TOKEN_EXPIRY = '12h';

/** Sign a new JWT for a session */
export function signToken(payload: Omit<SessionPayload, 'iat' | 'exp'>): string {
  const { jwtSecret } = getEnvConfig();
  return jwt.sign(payload, jwtSecret, { expiresIn: TOKEN_EXPIRY });
}

/** Verify and decode a JWT. Throws on invalid/expired token. */
export function verifyToken(token: string): SessionPayload {
  const { jwtSecret } = getEnvConfig();
  try {
    return jwt.verify(token, jwtSecret) as SessionPayload;
  } catch {
    throw new Error('Invalid or expired session token.');
  }
}

/**
 * Extract session from request.
 * Checks: Authorization header → Cookie `zerone_session`
 * Returns null if no token found or invalid.
 */
export function getSession(req: NextRequest): SessionPayload | null {
  try {
    // 1. Check Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      return verifyToken(token);
    }

    // 2. Check cookie
    const cookie = req.cookies.get('zerone_session');
    if (cookie?.value) {
      return verifyToken(cookie.value);
    }

    return null;
  } catch {
    return null;
  }
}

/** Build Set-Cookie header string for session cookie */
export function buildSessionCookie(token: string): string {
  const { isProduction } = getEnvConfig();
  return [
    `zerone_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${12 * 60 * 60}`, // 12 hours
    isProduction ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

/** Build cookie header to clear session */
export function clearSessionCookie(): string {
  return 'zerone_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}
