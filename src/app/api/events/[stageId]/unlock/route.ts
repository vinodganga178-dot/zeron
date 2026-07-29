import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: false, error: 'Use /api/events/[stageId] PUT endpoint to update event status in ZERONE 7.0.' }, { status: 410 });
}
