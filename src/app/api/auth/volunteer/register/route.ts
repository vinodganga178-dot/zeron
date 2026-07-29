import { NextResponse } from 'next/server';
import { isFirebaseActive, db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { Volunteer } from '@/types';

export async function POST(req: Request) {
  try {
    const { name, email, phone, department, password } = await req.json();

    if (!name || !email || !phone || !department || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    if (!isFirebaseActive || !db) {
      return NextResponse.json({ success: false, error: 'Firebase is not active. Using sandbox mode.' }, { status: 400 });
    }

    // Check existing email
    const q = query(collection(db, 'volunteers'), where('email', '==', email.toLowerCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return NextResponse.json({ success: false, error: 'Email is already registered.' }, { status: 400 });
    }

    const uid = 'vol_' + Math.random().toString(36).substring(2, 11);
    const joinCode = 'VOL-' + Math.floor(1000 + Math.random() * 9000);

    const volunteer: Volunteer = {
      uid,
      name,
      email: email.toLowerCase(),
      phone,
      department,
      password,
      status: 'pending',
      assignedTeamId: null,
      joinCode,
      role: 'volunteer',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'volunteers', uid), volunteer);

    return NextResponse.json({
      success: true,
      data: { volunteer, token: `token_${uid}` },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Registration failed' }, { status: 500 });
  }
}
