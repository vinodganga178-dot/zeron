import { Team, LeaderboardEntry } from '@/types';

/**
 * Calculate total score for a team.
 * Formula: quiz + pitch + sell + treasureHunt + bonus - penalty
 */
export function calculateTotalScore(scores: Team['scores']): number {
  if (!scores) return 0;
  return (
    (scores.quiz ?? 0) +
    (scores.pitch ?? 0) +
    (scores.sell ?? 0) +
    (scores.treasureHunt ?? 0) +
    (scores.bonus ?? 0) -
    (scores.penalty ?? 0)
  );
}

/**
 * Build a sorted leaderboard from a teams record.
 * Ties are broken by team ID (alphabetical = registration order).
 */
export function buildLeaderboard(teams: Record<string, Team>): LeaderboardEntry[] {
  if (!teams) return [];
  const entries: LeaderboardEntry[] = Object.values(teams).map((team) => {
    const total = calculateTotalScore(team.scores);
    return {
      rank: 0,
      teamId: team.id,
      teamName: team.name,
      memberCount: team.members ? team.members.length : 0,
      members: team.members ? team.members.map((m) => m.name) : [],
      quiz: team.scores?.quiz ?? 0,
      pitch: team.scores?.pitch ?? 0,
      sell: team.scores?.sell ?? 0,
      treasureHunt: team.scores?.treasureHunt ?? 0,
      bonus: team.scores?.bonus ?? 0,
      penalty: team.scores?.penalty ?? 0,
      totalScore: total,
    };
  });

  entries.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.teamId.localeCompare(b.teamId);
  });

  entries.forEach((e, i) => { e.rank = i + 1; });

  return entries;
}

/**
 * Generate a unique Team ID in the format ZR-XXXX
 */
export function generateTeamId(existingIds: string[]): string {
  let id: string;
  do {
    const num = Math.floor(1000 + Math.random() * 9000);
    id = `ZR-${num}`;
  } while (existingIds.includes(id));
  return id;
}

// ── Compatibility Exports for legacy API routes ────────────────────────────────
export async function getLeaderboard() {
  return [];
}

export async function rebuildLeaderboardCache() {
  return [];
}
