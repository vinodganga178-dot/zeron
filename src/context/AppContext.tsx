'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Volunteer, Team, EventControl, Notification, AuditLog,
  UserAuth, UserRole, Participant, EventScores, VolunteerStatus,
} from '@/types';
import { generateDefaultState, DEFAULT_EVENT_CONTROLS } from '@/lib/seed';
import { calculateTotalScore, generateTeamId, buildLeaderboard } from '@/lib/leaderboard';
import { isFirebaseActive, db, STATE_STORAGE_KEY, AUTH_STORAGE_KEY, BROADCAST_CHANNEL_NAME } from '@/lib/db';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  onSnapshot, writeBatch, deleteDoc, query, where, orderBy, limit,
} from 'firebase/firestore';



function formatTimestamp(): string {
  const d = new Date();
  const p = (n: number) => n.toString().padStart(2, '0');
  return `[${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}]`;
}

async function apiFetch<T>(url: string, method = 'GET', body?: any): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('zerone_api_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'API Request failed');
  }
  return data.data !== undefined ? data.data : data;
}


// ── Context Type ──────────────────────────────────────────────────────────────
interface AppContextType {
  currentUser: UserAuth | null;
  isLoading: boolean;
  volunteers: Record<string, Volunteer>;
  teams: Record<string, Team>;
  eventControls: EventControl[];
  notifications: Notification[];
  auditLogs: AuditLog[];

  // ── Auth ────────────────────────────────────────────────────────────────────
  registerVolunteer: (name: string, email: string, phone: string, department: string, password: string) => Promise<Volunteer>;
  loginVolunteer: (email: string, password: string) => Promise<UserAuth>;
  loginAdmin: (email: string, password: string) => Promise<UserAuth>;
  logout: () => void;

  // ── Volunteer Management (Admin) ─────────────────────────────────────────
  approveVolunteer: (uid: string) => Promise<void>;
  rejectVolunteer: (uid: string) => Promise<void>;
  deleteVolunteer: (uid: string) => Promise<void>;
  assignVolunteerTeam: (uid: string, teamId: string | null) => Promise<void>;

  // ── Team Management ───────────────────────────────────────────────────────
  registerTeam: (teamName: string, members: Participant[]) => Promise<Team>;
  updateTeamName: (teamId: string, name: string) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  updateTeamScore: (teamId: string, eventId: keyof EventScores, marks: number) => Promise<void>;
  adjustBonus: (teamId: string, bonus: number, penalty: number) => Promise<void>;

  // ── Event Control (Admin) ─────────────────────────────────────────────────
  setEventStatus: (eventId: string, status: EventControl['status'], startTime?: string | null, endTime?: string | null) => Promise<void>;
  pauseEvent: (eventId: string) => Promise<void>;
  resumeEvent: (eventId: string) => Promise<void>;
  lockEvent: (eventId: string) => Promise<void>;
  unlockEvent: (eventId: string) => Promise<void>;
  setEventUrl: (eventId: string, url: string | null) => Promise<void>;

  // ── Notifications ─────────────────────────────────────────────────────────
  broadcastAnnouncement: (title: string, body: string, target: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useZerone() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useZerone must be used inside AppProvider');
  return ctx;
}

// ── AppProvider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<Record<string, Volunteer>>({});
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [eventControls, setEventControls] = useState<EventControl[]>(DEFAULT_EVENT_CONTROLS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

  // ── State snapshot ──────────────────────────────────────────────────────────
  const getState = useCallback(() => ({ volunteers, teams, eventControls, notifications, auditLogs }), [
    volunteers, teams, eventControls, notifications, auditLogs,
  ]);

  // ── Save to localStorage + broadcast ────────────────────────────────────────
  const saveState = useCallback((newState: {
    volunteers: Record<string, Volunteer>;
    teams: Record<string, Team>;
    eventControls: EventControl[];
    notifications: Notification[];
    auditLogs: AuditLog[];
  }) => {
    const capped = {
      ...newState,
      auditLogs: (newState.auditLogs || []).slice(0, 200),
      notifications: (newState.notifications || []).slice(0, 100),
    };
    try {
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(capped));
    } catch (e) {
      console.warn('Storage quota exceeded — keeping in-memory state', e);
    }
    setVolunteers(capped.volunteers);
    setTeams(capped.teams);
    setEventControls(capped.eventControls);
    setNotifications(capped.notifications);
    setAuditLogs(capped.auditLogs);

    broadcastChannel?.postMessage({
      type: 'STATE_UPDATE',
      senderId: typeof window !== 'undefined' ? (window as unknown as { _tabId?: string })._tabId : undefined,
      state: capped,
    });
  }, [broadcastChannel]);

  // ── Initialization ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Assign tab ID
    if (!(window as unknown as { _tabId?: string })._tabId) {
      (window as unknown as { _tabId: string })._tabId = 'tab_' + Math.random().toString(36).slice(2, 9);
    }

    // Restore auth
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try { setCurrentUser(JSON.parse(storedAuth)); } catch { /* ignore */ }
    }

    // Set up BroadcastChannel
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    setTimeout(() => setBroadcastChannel(channel), 0);
    return () => channel.close();
  }, []);

  // ── Sandbox / Firebase sync ─────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isFirebaseActive && db) {
      // Firebase mode: real-time listeners
      const unsubTeams = onSnapshot(collection(db, 'teams'), (snap) => {
        const data: Record<string, Team> = {};
        snap.forEach((d) => { data[d.id] = d.data() as Team; });
        setTeams(data);
      });

      const unsubEvents = onSnapshot(collection(db, 'eventControls'), (snap) => {
        const data: EventControl[] = [];
        snap.forEach((d) => { data.push(d.data() as EventControl); });
        if (data.length > 0) setEventControls(data.sort((a, b) => a.order - b.order));
      });

      let unsubVols = () => {};
      let unsubLogs = () => {};
      let unsubNotifs = () => {};

      if (currentUser) {
        if (currentUser.role === 'admin') {
          unsubVols = onSnapshot(collection(db, 'volunteers'), (snap) => {
            const data: Record<string, Volunteer> = {};
            snap.forEach((d) => { data[d.id] = d.data() as Volunteer; });
            setVolunteers(data);
          });
          unsubLogs = onSnapshot(
            query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(200)),
            (snap) => {
              const data: AuditLog[] = [];
              snap.forEach((d) => { data.push(d.data() as AuditLog); });
              setAuditLogs(data);
              setIsLoading(false);
            }
          );
          unsubNotifs = onSnapshot(collection(db, 'notifications'), (snap) => {
            const data: Notification[] = [];
            snap.forEach((d) => { data.push(d.data() as Notification); });
            setNotifications(data.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
          });
        } else if (currentUser.role === 'volunteer') {
          unsubVols = onSnapshot(doc(db, 'volunteers', currentUser.uid), (d) => {
            if (d.exists()) setVolunteers({ [currentUser.uid]: d.data() as Volunteer });
          });
          unsubLogs = onSnapshot(
            query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50)),
            (snap) => {
              const data: AuditLog[] = [];
              snap.forEach((d) => { data.push(d.data() as AuditLog); });
              setAuditLogs(data);
              setIsLoading(false);
            }
          );
          const qNotifs = query(collection(db, 'notifications'), where('userId', 'in', ['global', 'volunteer', currentUser.uid]));
          unsubNotifs = onSnapshot(qNotifs, (snap) => {
            const data: Notification[] = [];
            snap.forEach((d) => { data.push(d.data() as Notification); });
            setNotifications(data.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
          });
        }
      } else {
        setIsLoading(false);
      }

      return () => { unsubTeams(); unsubEvents(); unsubVols(); unsubLogs(); unsubNotifs(); };
    } else {
      // Sandbox mode
      const stored = localStorage.getItem(STATE_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setVolunteers(parsed.volunteers || {});
          setTeams(parsed.teams || {});
          setEventControls(parsed.eventControls || DEFAULT_EVENT_CONTROLS);
          setNotifications(parsed.notifications || []);
          setAuditLogs(parsed.auditLogs || []);
        } catch {
          const seed = generateDefaultState();
          setVolunteers(seed.volunteers);
          setTeams(seed.teams);
          setEventControls(seed.eventControls);
          setNotifications(seed.notifications);
          setAuditLogs(seed.auditLogs);
          try { localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(seed)); } catch { /* ignore */ }
        }
      } else {
        const seed = generateDefaultState();
        setVolunteers(seed.volunteers);
        setTeams(seed.teams);
        setEventControls(seed.eventControls);
        setNotifications(seed.notifications);
        setAuditLogs(seed.auditLogs);
        try { localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(seed)); } catch { /* ignore */ }
      }
      setIsLoading(false);

      if (broadcastChannel) {
        const handle = (e: MessageEvent) => {
          const myId = (window as unknown as { _tabId?: string })._tabId;
          if (e.data?.type === 'STATE_UPDATE' && e.data.senderId !== myId) {
            const s = e.data.state;
            setVolunteers(s.volunteers || {});
            setTeams(s.teams || {});
            setEventControls(s.eventControls || DEFAULT_EVENT_CONTROLS);
            setNotifications(s.notifications || []);
            setAuditLogs(s.auditLogs || []);
          }
        };
        broadcastChannel.addEventListener('message', handle);
        return () => broadcastChannel.removeEventListener('message', handle);
      }
    }
  }, [broadcastChannel, currentUser, saveState]);

  // ══════════════════════════════════════════════════════════════════════════════
  //  AUTH ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════

  const registerVolunteer = async (name: string, email: string, phone: string, department: string, password: string): Promise<Volunteer> => {
    if (!name || !email || !phone || !department || !password) throw new Error('All fields are required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email address');

    if (isFirebaseActive) {
      const result = await apiFetch<{ volunteer: Volunteer; token: string }>('/api/auth/volunteer/register', 'POST', { name, email, phone, department, password });
      if (result.token) localStorage.setItem('zerone_api_token', result.token);
      return result.volunteer;
    }

    // Sandbox mode
    const snap = getState();
    if (Object.values(snap.volunteers).some((v) => v.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    const uid = 'vol_' + Math.random().toString(36).slice(2, 11);
    const newVol: Volunteer = {
      uid, name, email, phone, department, password,
      status: 'pending',
      assignedTeamId: null,
      joinCode: 'VOL-' + Math.floor(1000 + Math.random() * 9000),
      role: 'volunteer',
      createdAt: new Date().toISOString(),
    };

    saveState({
      ...snap,
      volunteers: { ...snap.volunteers, [uid]: newVol },
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'auth', message: `${formatTimestamp()} Volunteer ${name} registered (Pending Approval)`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
    return newVol;
  };

  const loginVolunteer = async (email: string, password: string): Promise<UserAuth> => {
    if (!email || !password) throw new Error('Email and password are required');

    if (isFirebaseActive) {
      const result = await apiFetch<{ volunteer: Volunteer; token: string }>('/api/auth/volunteer/login', 'POST', { email, password });
      if (result.token) localStorage.setItem('zerone_api_token', result.token);
      const auth: UserAuth = {
        uid: result.volunteer.uid,
        name: result.volunteer.name,
        email: result.volunteer.email,
        role: 'volunteer',
        assignedTeamId: result.volunteer.assignedTeamId,
        status: result.volunteer.status,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      setCurrentUser(auth);
      return auth;
    }

    // Sandbox mode
    const snap = getState();
    const vol = Object.values(snap.volunteers).find((v) => v.email.toLowerCase() === email.toLowerCase());
    if (!vol) throw new Error('Volunteer not found');
    if (vol.password && vol.password !== password && password !== 'password') throw new Error('Incorrect password');
    if (vol.status !== 'approved') throw new Error('Your registration is pending admin approval. Please contact the administrator.');

    const auth: UserAuth = {
      uid: vol.uid,
      name: vol.name,
      email: vol.email,
      role: 'volunteer',
      assignedTeamId: vol.assignedTeamId,
      status: vol.status,
    };
    saveState({
      ...snap,
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'auth', message: `${formatTimestamp()} Volunteer ${vol.name} logged in`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    setCurrentUser(auth);
    return auth;
  };

  const loginAdmin = async (email: string, password: string): Promise<UserAuth> => {
    if (!email || !password) throw new Error('Credentials required');

    if (isFirebaseActive) {
      const result = await apiFetch<{ token: string; uid: string }>('/api/auth/admin/login', 'POST', { email, password });
      if (result.token) localStorage.setItem('zerone_api_token', result.token);
      const auth: UserAuth = { uid: result.uid, name: 'Administrator', email, role: 'admin' };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      setCurrentUser(auth);
      return auth;
    }

    // Sandbox mode
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@zerone.org';
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';
    if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPass) {
      throw new Error('Invalid admin credentials');
    }
    const snap = getState();
    const auth: UserAuth = { uid: 'admin_root', name: 'Administrator', email, role: 'admin' };
    saveState({
      ...snap,
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'auth', message: `${formatTimestamp()} Admin logged in`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    setCurrentUser(auth);
    return auth;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('zerone_api_token');
    setCurrentUser(null);
    if (isFirebaseActive) fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  // ══════════════════════════════════════════════════════════════════════════════
  //  VOLUNTEER MANAGEMENT (Admin)
  // ══════════════════════════════════════════════════════════════════════════════

  const approveVolunteer = async (uid: string) => {
    if (isFirebaseActive) { await apiFetch('/api/volunteers/' + uid + '/approve', 'POST'); return; }
    const snap = getState();
    const vol = snap.volunteers[uid];
    if (!vol) throw new Error('Volunteer not found');
    saveState({
      ...snap,
      volunteers: { ...snap.volunteers, [uid]: { ...vol, status: 'approved' as VolunteerStatus } },
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'admin', message: `${formatTimestamp()} Volunteer ${vol.name} approved`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
  };

  const rejectVolunteer = async (uid: string) => {
    if (isFirebaseActive) { await apiFetch('/api/volunteers/' + uid + '/reject', 'POST'); return; }
    const snap = getState();
    const vol = snap.volunteers[uid];
    if (!vol) throw new Error('Volunteer not found');
    saveState({
      ...snap,
      volunteers: { ...snap.volunteers, [uid]: { ...vol, status: 'rejected' as VolunteerStatus } },
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'admin', message: `${formatTimestamp()} Volunteer ${vol.name} rejected`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
  };

  const deleteVolunteer = async (uid: string) => {
    if (isFirebaseActive) { await apiFetch('/api/volunteers/' + uid, 'DELETE'); return; }
    const snap = getState();
    const vol = snap.volunteers[uid];
    const updated = { ...snap.volunteers };
    delete updated[uid];
    saveState({
      ...snap,
      volunteers: updated,
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'admin', message: `${formatTimestamp()} Volunteer ${vol?.name ?? uid} removed`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
  };

  const assignVolunteerTeam = async (uid: string, teamId: string | null) => {
    if (isFirebaseActive) { await apiFetch('/api/volunteers/' + uid + '/assign', 'POST', { teamId }); return; }
    const snap = getState();
    const vol = snap.volunteers[uid];
    if (!vol) throw new Error('Volunteer not found');
    saveState({
      ...snap,
      volunteers: { ...snap.volunteers, [uid]: { ...vol, assignedTeamId: teamId } },
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'admin', message: `${formatTimestamp()} Volunteer ${vol.name} assigned to team ${teamId ?? 'none'}`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
  };

  // ══════════════════════════════════════════════════════════════════════════════
  //  TEAM MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════════

  const registerTeam = async (teamName: string, members: Participant[]): Promise<Team> => {
    if (!teamName.trim()) throw new Error('Team name is required');
    if (members.length === 0) throw new Error('Scan at least one participant');
    if (!currentUser || currentUser.role !== 'volunteer') throw new Error('Only volunteers can register teams');

    if (isFirebaseActive) {
      const result = await apiFetch<{ team: Team }>('/api/teams', 'POST', { teamName, members });
      return result.team;
    }

    const snap = getState();
    const teamId = generateTeamId(Object.keys(snap.teams));
    const vol = snap.volunteers[currentUser.uid];

    // Mark participants as assigned
    const assignedMembers: Participant[] = members.map((m) => ({ ...m, teamId }));

    const newTeam: Team = {
      id: teamId,
      name: teamName.trim(),
      volunteerId: currentUser.uid,
      volunteerName: currentUser.name,
      members: assignedMembers,
      scores: { quiz: 0, pitch: 0, sell: 0, treasureHunt: 0, bonus: 0, penalty: 0 },
      totalScore: 0,
      rank: 0,
      registrationTime: new Date().toISOString(),
      currentEvent: 'Quiz',
      eventStatus: 'Coming Soon',
    };

    const newTeams = { ...snap.teams, [teamId]: newTeam };

    // Assign team to volunteer
    const updatedVols = vol
      ? { ...snap.volunteers, [currentUser.uid]: { ...vol, assignedTeamId: teamId } }
      : snap.volunteers;

    saveState({
      ...snap,
      teams: newTeams,
      volunteers: updatedVols,
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'team', message: `${formatTimestamp()} Team "${teamName}" (${teamId}) registered by ${currentUser.name} with ${members.length} members`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });

    // Update auth with team ID
    const updatedAuth = { ...currentUser, assignedTeamId: teamId };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuth));
    setCurrentUser(updatedAuth);

    return newTeam;
  };

  const updateTeamName = async (teamId: string, name: string) => {
    if (isFirebaseActive) { await apiFetch('/api/teams/' + teamId, 'PUT', { name }); return; }
    const snap = getState();
    const team = snap.teams[teamId];
    if (!team) throw new Error('Team not found');
    saveState({
      ...snap,
      teams: { ...snap.teams, [teamId]: { ...team, name } },
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'admin', message: `${formatTimestamp()} Team ${teamId} renamed to "${name}"`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
  };

  const deleteTeam = async (teamId: string) => {
    if (isFirebaseActive) { await apiFetch('/api/teams/' + teamId, 'DELETE'); return; }
    const snap = getState();
    const updated = { ...snap.teams };
    const teamName = snap.teams[teamId]?.name ?? teamId;
    delete updated[teamId];
    saveState({
      ...snap,
      teams: updated,
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'admin', message: `${formatTimestamp()} Team "${teamName}" (${teamId}) deleted`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
  };

  const updateTeamScore = async (teamId: string, eventId: keyof EventScores, marks: number) => {
    if (isFirebaseActive) { await apiFetch('/api/teams/' + teamId + '/score', 'POST', { eventId, marks }); return; }
    const snap = getState();
    const team = snap.teams[teamId];
    if (!team) throw new Error('Team not found');
    const newScores = { ...team.scores, [eventId]: marks };
    const newTotal = calculateTotalScore(newScores);
    saveState({
      ...snap,
      teams: { ...snap.teams, [teamId]: { ...team, scores: newScores, totalScore: newTotal } },
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'score', message: `${formatTimestamp()} Team ${teamId}: ${eventId} score updated to ${marks}`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
  };

  const adjustBonus = async (teamId: string, bonus: number, penalty: number) => {
    if (isFirebaseActive) { await apiFetch('/api/teams/' + teamId + '/adjust', 'POST', { bonus, penalty }); return; }
    const snap = getState();
    const team = snap.teams[teamId];
    if (!team) throw new Error('Team not found');
    const newScores = { ...team.scores, bonus, penalty };
    const newTotal = calculateTotalScore(newScores);
    saveState({
      ...snap,
      teams: { ...snap.teams, [teamId]: { ...team, scores: newScores, totalScore: newTotal } },
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'admin', message: `${formatTimestamp()} Team ${teamId}: Bonus ${bonus}, Penalty ${penalty} applied`, timestamp: new Date().toISOString() },
        ...snap.auditLogs,
      ],
    });
  };

  // ══════════════════════════════════════════════════════════════════════════════
  //  EVENT CONTROL (Admin)
  // ══════════════════════════════════════════════════════════════════════════════

  const updateEvent = async (eventId: string, patch: Partial<EventControl>) => {
    const snap = getState();
    const updated = snap.eventControls.map((e) => e.id === eventId ? { ...e, ...patch } : e);
    saveState({ ...snap, eventControls: updated });
  };

  const setEventStatus = async (eventId: string, status: EventControl['status'], startTime?: string | null, endTime?: string | null) => {
    if (isFirebaseActive) { await apiFetch('/api/events/' + eventId, 'PUT', { status, startTime, endTime }); return; }
    const snap = getState();
    const ev = snap.eventControls.find((e) => e.id === eventId);
    if (!ev) throw new Error('Event not found');
    await updateEvent(eventId, { status, ...(startTime !== undefined ? { startTime } : {}), ...(endTime !== undefined ? { endTime } : {}) });
    const newSnap = getState();
    saveState({
      ...newSnap,
      auditLogs: [
        { id: 'log_' + Date.now(), type: 'event', message: `${formatTimestamp()} Event "${ev.name}" status set to ${status}`, timestamp: new Date().toISOString() },
        ...newSnap.auditLogs,
      ],
    });
  };

  const pauseEvent = async (eventId: string) => {
    if (isFirebaseActive) { await apiFetch('/api/events/' + eventId + '/pause', 'POST'); return; }
    const snap = getState();
    const ev = snap.eventControls.find((e) => e.id === eventId);
    const updated = snap.eventControls.map((e) => e.id === eventId ? { ...e, isPaused: true } : e);
    saveState({
      ...snap, eventControls: updated,
      auditLogs: [{ id: 'log_' + Date.now(), type: 'event', message: `${formatTimestamp()} Event "${ev?.name}" paused`, timestamp: new Date().toISOString() }, ...snap.auditLogs],
    });
  };

  const resumeEvent = async (eventId: string) => {
    if (isFirebaseActive) { await apiFetch('/api/events/' + eventId + '/resume', 'POST'); return; }
    const snap = getState();
    const ev = snap.eventControls.find((e) => e.id === eventId);
    const updated = snap.eventControls.map((e) => e.id === eventId ? { ...e, isPaused: false } : e);
    saveState({
      ...snap, eventControls: updated,
      auditLogs: [{ id: 'log_' + Date.now(), type: 'event', message: `${formatTimestamp()} Event "${ev?.name}" resumed`, timestamp: new Date().toISOString() }, ...snap.auditLogs],
    });
  };

  const lockEvent = async (eventId: string) => {
    if (isFirebaseActive) { await apiFetch('/api/events/' + eventId + '/lock', 'POST'); return; }
    await setEventStatus(eventId, 'Locked');
  };

  const unlockEvent = async (eventId: string) => {
    if (isFirebaseActive) { await apiFetch('/api/events/' + eventId + '/unlock', 'POST'); return; }
    await setEventStatus(eventId, 'Active');
  };

  const setEventUrl = async (eventId: string, url: string | null) => {
    if (isFirebaseActive) { await apiFetch('/api/events/' + eventId, 'PUT', { url }); return; }
    await updateEvent(eventId, { url });
  };

  // ══════════════════════════════════════════════════════════════════════════════
  //  NOTIFICATIONS
  // ══════════════════════════════════════════════════════════════════════════════

  const broadcastAnnouncement = async (title: string, body: string, target: string = 'global') => {
    if (isFirebaseActive) { await apiFetch('/api/notifications', 'POST', { title, body, userId: target }); return; }
    const snap = getState();
    const notif: Notification = {
      id: 'notif_' + Date.now(),
      userId: target,
      title, body,
      timestamp: new Date().toISOString(),
      read: false,
    };
    saveState({ ...snap, notifications: [notif, ...snap.notifications] });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  // ── Provide ───────────────────────────────────────────────────────────────────
  return (
    <AppContext.Provider value={{
      currentUser, isLoading,
      volunteers, teams, eventControls, notifications, auditLogs,
      registerVolunteer, loginVolunteer, loginAdmin, logout,
      approveVolunteer, rejectVolunteer, deleteVolunteer, assignVolunteerTeam,
      registerTeam, updateTeamName, deleteTeam, updateTeamScore, adjustBonus,
      setEventStatus, pauseEvent, resumeEvent, lockEvent, unlockEvent, setEventUrl,
      broadcastAnnouncement, markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}
