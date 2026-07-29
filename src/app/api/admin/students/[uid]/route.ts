import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: false, error: 'Student endpoints deprecated in ZERONE 7.0 architecture.' }, { status: 410 });
}

export async function PATCH() {
  return NextResponse.json({ success: false, error: 'Student endpoints deprecated in ZERONE 7.0 architecture.' }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Student endpoints deprecated in ZERONE 7.0 architecture.' }, { status: 410 });
}
