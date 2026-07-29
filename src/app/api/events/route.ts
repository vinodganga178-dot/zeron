import { NextResponse } from 'next/server';
import { isFirebaseActive, db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { EventControl } from '@/types';
import { DEFAULT_EVENT_CONTROLS } from '@/lib/seed';

export async function GET() {
  try {
    if (isFirebaseActive && db) {
      const snap = await getDocs(collection(db, 'eventControls'));
      const data: EventControl[] = [];
      snap.forEach((d) => { data.push(d.data() as EventControl); });
      if (data.length > 0) {
        data.sort((a, b) => a.order - b.order);
        return NextResponse.json({ success: true, data });
      }
    }
    return NextResponse.json({ success: true, data: DEFAULT_EVENT_CONTROLS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
