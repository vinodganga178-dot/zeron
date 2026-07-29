// ─────────────────────────────────────────────────────────────────────────────
//  ZERONE 7.0 — Core Type Definitions
//  Main Website: Central management platform (Volunteers, Teams, Events, Leaderboard)
//  Event logic lives ONLY in external event websites.
// ─────────────────────────────────────────────────────────────────────────────

// ── Participant (scanned via QR during team formation) ───────────────────────
export interface Participant {
  id: string;         // Unique QR-derived ID (e.g. "ZR-4821")
  name: string;
  department: string;
  teamId: string | null; // null = not yet assigned to a team
}

// ── Volunteer ────────────────────────────────────────────────────────────────
export type VolunteerStatus = 'pending' | 'approved' | 'rejected';

export interface Volunteer {
  uid: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  password?: string;
  status: VolunteerStatus;   // Admin must approve before login is possible
  assignedTeamId: string | null;
  joinCode: string;          // Used to identify volunteer during team formation
  role: 'volunteer';
  createdAt: string;
}

// ── Event Score Breakdown (submitted by external event websites) ─────────────
export interface EventScores {
  quiz: number;
  pitch: number;
  sell: number;
  treasureHunt: number;
  bonus: number;    // Admin-adjustable
  penalty: number;  // Admin-adjustable
}

// ── Team (created by volunteer via QR scanning) ──────────────────────────────
export interface Team {
  id: string;           // e.g. "ZR-7049"
  name: string;
  volunteerId: string;
  volunteerName: string;
  members: Participant[];
  scores: EventScores;
  totalScore: number;   // quiz + pitch + sell + treasureHunt + bonus - penalty
  rank: number;
  registrationTime: string;
  currentEvent: string; // Last active event name
  eventStatus: 'Coming Soon' | 'Active' | 'Locked' | 'Completed';
}

// ── Event Control (managed by admin only) ────────────────────────────────────
export type EventStatus = 'Coming Soon' | 'Active' | 'Locked' | 'Completed';

export interface EventControl {
  id: 'quiz' | 'pitch' | 'sell' | 'treasureHunt';
  name: string;
  description: string;
  status: EventStatus;
  startTime: string | null;
  endTime: string | null;
  isPaused: boolean;
  url: string | null;      // Future: URL of the external event website
  order: number;           // Display order in roadmap (1-4)
}

// ── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;  // 'global', 'volunteer', specific uid, or team id
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

// ── Audit Log ────────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  type: 'auth' | 'team' | 'event' | 'score' | 'admin';
  message: string;
  timestamp: string;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'volunteer' | 'admin';

export interface UserAuth {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  assignedTeamId?: string | null;
  status?: VolunteerStatus; // for volunteer users
}

// ── Leaderboard Entry (derived from teams) ───────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  memberCount: number;
  members: string[];       // member names
  quiz: number;
  pitch: number;
  sell: number;
  treasureHunt: number;
  bonus: number;
  penalty: number;
  totalScore: number;
}

// ── Score Submission (from external event websites via API) ──────────────────
export interface ScoreSubmission {
  eventId: 'quiz' | 'pitch' | 'sell' | 'treasureHunt';
  marks: number;
  submittedBy: string;     // event website identifier
  submittedAt: string;
}

// ── QR Scan Result ───────────────────────────────────────────────────────────
export interface QRScanResult {
  id: string;
  name: string;
  department: string;
}
