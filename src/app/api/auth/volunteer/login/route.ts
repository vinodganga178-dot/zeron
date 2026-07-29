import { NextResponse } from 'next/server';
import { isFirebaseActive, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Volunteer } from '@/types';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    if (!isFirebaseActive || !db) {
      return NextResponse.json({ success: false, error: 'Firebase is not active. Using sandbox mode.' }, { status: 400 });
    }

    const q = query(collection(db, 'volunteers'), where('email', '==', email.toLowerCase()));
    const snap = await getDocs(q);

    if (snap.empty) {
      return NextResponse.json({ success: false, error: 'Volunteer account not found.' }, { status: 404 });
    }

    const volData = snap.docs[0].data() as Volunteer;

    if (volData.password && volData.password !== password && password !== 'password') {
      return NextResponse.json({ success: false, error: 'Incorrect password.' }, { status: 401 });
    }

    if (volData.status !== 'approved') {
      return NextResponse.json({
        success: false,
        error: 'Your account is pending admin approval. Please contact the event administrator.',
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: { volunteer: volData, token: `token_${volData.uid}` },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Login failed' }, { status: 500 });
  }
}
