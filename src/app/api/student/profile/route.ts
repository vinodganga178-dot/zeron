import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: false, error: 'Student profile API deprecated in ZERONE 7.0 architecture.' }, { status: 410 });
}
