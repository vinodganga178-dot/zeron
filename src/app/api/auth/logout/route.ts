import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth-middleware';
import { ApiResponse } from '@/types/api';

export async function POST() {
  return NextResponse.json<ApiResponse>(
    { success: true, message: 'Logged out successfully.' },
    { headers: { 'Set-Cookie': clearSessionCookie() } }
  );
}
