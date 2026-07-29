import { NextResponse } from 'next/server';
import { isFirebaseActive, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SystemSettings } from '@/types/api';

const SETTINGS_DOC = 'main';

export async function GET() {
  try {
    if (isFirebaseActive && db) {
      const docSnap = await getDoc(doc(db, 'systemSettings', SETTINGS_DOC));
      if (docSnap.exists()) {
        return NextResponse.json({ success: true, data: docSnap.data() as SystemSettings });
      }
    }
    const defaults: SystemSettings = {
      maxParticipantsPerTeam: 10,
      totalTeams: 50,
      platformOpen: true,
      registrationOpen: true,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, data: defaults });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (isFirebaseActive && db) {
      const updates: Partial<SystemSettings> = { updatedAt: new Date().toISOString() };
      if (body.maxParticipantsPerTeam !== undefined) updates.maxParticipantsPerTeam = body.maxParticipantsPerTeam;
      if (body.totalTeams !== undefined) updates.totalTeams = body.totalTeams;
      if (body.platformOpen !== undefined) updates.platformOpen = body.platformOpen;
      if (body.registrationOpen !== undefined) updates.registrationOpen = body.registrationOpen;

      await setDoc(doc(db, 'systemSettings', SETTINGS_DOC), updates, { merge: true });
      return NextResponse.json({ success: true, data: updates });
    }
    return NextResponse.json({ success: true, message: 'System settings patch active' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
