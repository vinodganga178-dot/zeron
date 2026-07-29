import { NextRequest, NextResponse } from 'next/server';
import { signToken, buildSessionCookie } from '@/lib/auth-middleware';
import { fail } from '@/lib/with-auth';
import { ApiResponse } from '@/types/api';

const ADMIN_UID = 'admin_zerone_root';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return fail('Invalid JSON body');

  const { password } = body as { password?: string };
  if (!password) return fail('password is required.');

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return fail('ADMIN_PASSWORD environment variable is not set.', 500);
  }

  if (password !== adminPassword) {
    return fail('Invalid admin password.', 401);
  }

  const token = signToken({
    uid: ADMIN_UID,
    role: 'admin',
    email: 'admin@zerone.ieee',
    name: 'IEEE Zerone Admin',
  });
  const cookie = buildSessionCookie(token);

  return NextResponse.json<ApiResponse<{ token: string; uid: string }>>(
    { success: true, data: { token, uid: ADMIN_UID } },
    { headers: { 'Set-Cookie': cookie } }
  );
}
