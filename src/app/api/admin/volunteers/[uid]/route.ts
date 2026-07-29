import { NextResponse } from 'next/server';
import { isFirebaseActive, db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Volunteer } from '@/types';

type Params = { params: Promise<{ uid: string }> };

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { uid } = await params;
    if (isFirebaseActive && db) {
      const volRef = doc(db, 'volunteers', uid);
      const volSnap = await getDoc(volRef);
      if (!volSnap.exists()) {
        return NextResponse.json({ success: false, error: 'Volunteer not found.' }, { status: 404 });
      }
      await deleteDoc(volRef);
      return NextResponse.json({ success: true, data: { deleted: uid } });
    }
    return NextResponse.json({ success: true, message: 'Volunteer delete endpoint active.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { uid } = await params;
    const body = await req.json();
    if (isFirebaseActive && db) {
      const volRef = doc(db, 'volunteers', uid);
      const updates: Partial<Volunteer> = {};
      if (body.assignedTeamId !== undefined) updates.assignedTeamId = body.assignedTeamId;
      if (body.status !== undefined) updates.status = body.status;
      await updateDoc(volRef, updates);
      return NextResponse.json({ success: true, data: { uid, ...updates } });
    }
    return NextResponse.json({ success: true, message: 'Volunteer patch endpoint active.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
