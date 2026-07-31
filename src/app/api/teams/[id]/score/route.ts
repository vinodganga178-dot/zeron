import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-service';
import { validateScorePayload } from '@/lib/validation';
import { isFirebaseActive, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { Team, EventScores } from '@/types';
import { calculateTotalScore } from '@/lib/leaderboard';
import { productionCache } from '@/lib/cache';
import { recordAuditLog } from '@/lib/audit-logger';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: teamId } = await params;
    const body = await req.json();

    // 1. Validation
    const validation = validateScorePayload(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const { eventId, marks } = validation.data;

    // 2. Firebase Cloud Database Path with Atomic Transaction
    if (isFirebaseActive && db) {
      const teamRef = doc(db, 'teams', teamId);
      
      const transactionResult = await runTransaction(db, async (transaction) => {
        const teamSnap = await transaction.get(teamRef);
        if (!teamSnap.exists()) {
          throw new Error(`Team ${teamId} not found.`);
        }

        const teamData = teamSnap.data() as Team;
        const updatedScores: EventScores = {
          ...teamData.scores,
          [eventId]: marks,
        };

        const newTotal = calculateTotalScore(updatedScores);

        transaction.update(teamRef, {
          scores: updatedScores,
          totalScore: newTotal,
          currentEvent: eventId,
        });

        return { teamId, eventId, marksSubmitted: marks, newTotalScore: newTotal };
      });

      productionCache.invalidate('leaderboard');
      await recordAuditLog({
        type: 'score',
        message: `Score updated for Team ${teamId} in ${eventId}: ${marks} pts.`,
      });

      return NextResponse.json({
        success: true,
        data: {
          ...transactionResult,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // 3. Standalone / Memory Database Path with Atomic Transaction & Optimistic Locking
    const expectedVersion = body.version ? Number(body.version) : undefined;
    const result = await dbStore.updateTeamScoreTransaction(teamId, eventId, marks, expectedVersion);

    return NextResponse.json({
      success: true,
      data: {
        teamId,
        eventId,
        marksSubmitted: marks,
        newTotalScore: result.newTotal,
        version: result.version,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    const isConflict = error.message?.includes('Concurrency conflict');
    return NextResponse.json(
      { success: false, error: error.message || 'Score update failed' },
      { status: isConflict ? 409 : 500 }
    );
  }
}
