import { NextResponse } from 'next/server';
import { isFirebaseActive, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { EventControl } from '@/types';

type Params = { params: Promise<{ stageId: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const { stageId } = await params;
    const body = await req.json();

    if (isFirebaseActive && db) {
      const evRef = doc(db, 'eventControls', stageId);
      const evSnap = await getDoc(evRef);
      if (!evSnap.exists()) {
        return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
      }

      const updates: Partial<EventControl> = {};
      if (body.status !== undefined) updates.status = body.status;
      if (body.startTime !== undefined) updates.startTime = body.startTime;
      if (body.endTime !== undefined) updates.endTime = body.endTime;
      if (body.isPaused !== undefined) updates.isPaused = body.isPaused;
      if (body.url !== undefined) updates.url = body.url;

      await updateDoc(evRef, updates);
      return NextResponse.json({ success: true, data: { id: stageId, ...updates } });
    }

    return NextResponse.json({ success: true, message: 'Event control update active' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
