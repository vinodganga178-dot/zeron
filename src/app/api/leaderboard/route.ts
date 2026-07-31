import { NextResponse } from 'next/server';
import { isFirebaseActive, db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Team, LeaderboardEntry } from '@/types';
import { buildLeaderboard } from '@/lib/leaderboard';
import { productionCache } from '@/lib/cache';
import { dbStore } from '@/lib/db-service';

export async function GET() {
  try {
    // 1. Check Memory Cache first (sub-millisecond response for 500+ concurrent live users)
    const cachedLeaderboard = productionCache.get<LeaderboardEntry[]>('leaderboard_data');
    if (cachedLeaderboard) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: cachedLeaderboard,
      });
    }

    // 2. Fetch teams from Cloud or Memory store
    let teams: Record<string, Team> = {};

    if (isFirebaseActive && db) {
      const snap = await getDocs(collection(db, 'teams'));
      snap.forEach((doc) => {
        teams[doc.id] = doc.data() as Team;
      });
    } else {
      teams = await dbStore.getAllTeams();
    }

    const leaderboard = buildLeaderboard(teams);

    // 3. Store in cache for 5 seconds TTL
    productionCache.set('leaderboard_data', leaderboard, 5000);

    return NextResponse.json({
      success: true,
      cached: false,
      data: leaderboard,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
