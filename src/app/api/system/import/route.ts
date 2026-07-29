import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: false, error: 'System import deprecated in ZERONE 7.0 architecture.' }, { status: 410 });
}
