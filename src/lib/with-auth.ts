/**
 * withAuth — Permission middleware for API route handlers.
 * Compatible with Next.js 16 App Router (params as Promise).
 *
 * Usage:
 *   export const POST = withAuth(['volunteer', 'admin'], async (req, session) => {
 *     // session.uid, session.role, session.email are guaranteed
 *   });
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './auth-middleware';
import { UserRole } from '@/types';
import { ApiResponse } from '@/types/api';

// Next.js 16 App Router context type — params are Promises
type NextRouteContext = { params: Promise<Record<string, string>> };

type AuthRouteHandler = (
  req: NextRequest,
  session: { uid: string; role: UserRole; email: string; name: string }
) => Promise<NextResponse>;

type PublicRouteHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Wrap a handler with role-based authentication.
 * Returns a Next.js 16 compatible route function.
 */
export function withAuth(allowedRoles: UserRole[], handler: AuthRouteHandler) {
  return async (req: NextRequest, _context: NextRouteContext): Promise<NextResponse> => {
    const session = getSession(req);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Forbidden. Required role: [${allowedRoles.join(', ')}]. Your role: ${session.role}`,
        },
        { status: 403 }
      );
    }

    try {
      return await handler(req, session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      console.error('[API Error]', req.url, err);
      return NextResponse.json<ApiResponse>(
        { success: false, error: message },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrap a public handler (no auth required).
 * Returns a Next.js 16 compatible route function.
 */
export function withPublic(handler: PublicRouteHandler) {
  return async (req: NextRequest, _context: NextRouteContext): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      console.error('[API Error]', req.url, err);
      return NextResponse.json<ApiResponse>(
        { success: false, error: message },
        { status: 500 }
      );
    }
  };
}

/** Helper: standard JSON success response */
export function ok<T>(data: T, message?: string): NextResponse {
  return NextResponse.json<ApiResponse<T>>({ success: true, data, message });
}

/** Helper: standard JSON error response */
export function fail(error: string, status = 400): NextResponse {
  return NextResponse.json<ApiResponse>({ success: false, error }, { status });
}
