import { NextResponse } from 'next/server';
import { isFirebaseActive, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Team, EventScores } from '@/types';
import { calculateTotalScore } from '@/lib/leaderboard';

/**
 * PUBLIC SCORE API ENDPOINT
 * 
 * Every independent event website (Quiz, Pitch, Sell, Treasure Hunt) submits
 * scores to this endpoint upon completing an event for a team.
 * 
 * Request body:
 * {
 *   "eventId": "quiz" | "pitch" | "sell" | "treasureHunt",
 *   "marks": 85,
 *   "apiKey": "optional_event_api_key"
 * }
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: teamId } = await params;
    const { eventId, marks } = await req.json();

    if (!teamId || !eventId || marks === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: teamId, eventId, and marks are required.',
      }, { status: 400 });
    }

    const validEvents: Array<keyof EventScores> = ['quiz', 'pitch', 'sell', 'treasureHunt'];
    if (!validEvents.includes(eventId as keyof EventScores)) {
      return NextResponse.json({
        success: false,
        error: `Invalid eventId. Must be one of: ${validEvents.join(', ')}`,
      }, { status: 400 });
    }

    const numMarks = Number(marks);
    if (isNaN(numMarks)) {
      return NextResponse.json({ success: false, error: 'Marks must be a valid number.' }, { status: 400 });
    }

    if (isFirebaseActive && db) {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);

      if (!teamSnap.exists()) {
        return NextResponse.json({ success: false, error: `Team ${teamId} not found.` }, { status: 404 });
      }

      const teamData = teamSnap.data() as Team;
      const updatedScores: EventScores = {
        ...teamData.scores,
        [eventId]: numMarks,
      };

      const newTotal = calculateTotalScore(updatedScores);

      await updateDoc(teamRef, {
        scores: updatedScores,
        totalScore: newTotal,
        currentEvent: eventId,
      });

      return NextResponse.json({
        success: true,
        data: {
          teamId,
          eventId,
          marksSubmitted: numMarks,
          newTotalScore: newTotal,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Sandbox mode endpoint active. Please trigger update via AppContext or Firebase.',
      data: { teamId, eventId, marksSubmitted: numMarks },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Score update failed' }, { status: 500 });
  }
}
