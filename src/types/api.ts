import { Volunteer, Team, EventControl, EventScores, Notification, AuditLog, UserAuth, UserRole, Participant } from '@/types';

export interface SystemSettings {
  maxParticipantsPerTeam: number;
  totalTeams: number;
  platformOpen: boolean;
  registrationOpen: boolean;
  updatedAt: string;
}

export interface SessionPayload {
  uid: string;
  role: UserRole;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type { Volunteer, Team, EventControl, EventScores, Notification, AuditLog, UserAuth, UserRole, Participant };
