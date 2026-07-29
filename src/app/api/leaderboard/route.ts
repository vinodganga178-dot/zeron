import { NextResponse } from 'next/server';
import { isFirebaseActive, db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Team } from '@/types';
import { buildLeaderboard } from '@/lib/leaderboard';

export async function GET() {
  try {
    if (isFirebaseActive && db) {
      const snap = await getDocs(collection(db, 'teams'));
      const teams: Record<string, Team> = {};
      snap.forEach((doc) => {
        teams[doc.id] = doc.data() as Team;
      });
      const leaderboard = buildLeaderboard(teams);
      return NextResponse.json({ success: true, data: leaderboard });
    }

    return NextResponse.json({
      success: true,
      message: 'Sandbox mode leaderboard. Connect to Firebase or view via AppContext live state.',
      data: [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
