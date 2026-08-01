'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';
import { buildLeaderboard } from '@/lib/leaderboard';
import CollapsibleSidebar from '@/components/layout/CollapsibleSidebar';
import { NavMenuItem } from '@/components/layout/CollapsibleSidebar';
import HorizontalRoadmap from '@/components/features/HorizontalRoadmap';
import { motion } from 'framer-motion';
import {
  Shield, Users, Workflow, Settings, LogOut, CheckCircle2,
  Play, Pause, Clock, Edit3, Trash2, ShieldAlert, Activity,
  ArrowRight, Trophy
} from 'lucide-react';

function AnimatedStat({ value, color = 'text-white' }: { value: string | number; color?: string }) {
  return (
    <motion.div className={`text-3xl font-bold heading ${color}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      {value}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const {
    currentUser, isLoading, volunteers, teams, eventControls, logout,
    approveVolunteer, rejectVolunteer, deleteVolunteer,
    updateTeamName, deleteTeam, updateTeamScore, adjustBonus,
    setEventStatus, pauseEvent, resumeEvent, setEventUrl,
  } = useZerone();

  const [activeTab, setActiveTab] = useState<'overview' | 'volunteers' | 'teams' | 'events'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editQuiz, setEditQuiz] = useState(0);
  const [editPitch, setEditPitch] = useState(0);
  const [editSell, setEditSell] = useState(0);
  const [editTreasure, setEditTreasure] = useState(0);
  const [editBonus, setEditBonus] = useState(0);
  const [editPenalty, setEditPenalty] = useState(0);

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventUrl, setEventUrlInput] = useState('');

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#94a3b8] text-sm">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  const volunteerList = Object.values(volunteers);
  const teamList = Object.values(teams);
  const leaderboard = buildLeaderboard(teams);
  const pendingVolunteers = volunteerList.filter((v: any) => v.status === 'pending');
  const approvedVolunteers = volunteerList.filter((v: any) => v.status === 'approved');
  const activeEvents = eventControls.filter((e: any) => e.status === 'Active').length;

  const openEditTeamModal = (t: any) => {
    setEditingTeamId(t.id);
    setEditTeamName(t.name);
    setEditQuiz(t.scores.quiz || 0);
    setEditPitch(t.scores.pitch || 0);
    setEditSell(t.scores.sell || 0);
    setEditTreasure(t.scores.treasureHunt || 0);
    setEditBonus(t.scores.bonus || 0);
    setEditPenalty(t.scores.penalty || 0);
  };

  const handleSaveTeamEdit = async () => {
    if (!editingTeamId) return;
    try {
      if (editTeamName.trim()) await updateTeamName(editingTeamId, editTeamName.trim());
      await updateTeamScore(editingTeamId, 'quiz', editQuiz);
      await updateTeamScore(editingTeamId, 'pitch', editPitch);
      await updateTeamScore(editingTeamId, 'sell', editSell);
      await updateTeamScore(editingTeamId, 'treasureHunt', editTreasure);
      await adjustBonus(editingTeamId, editBonus, editPenalty);
      setEditingTeamId(null);
    } catch (e: any) { alert(e.message || 'Failed to update team.'); }
  };

  const openEventTimerModal = (ev: any) => {
    setEditingEventId(ev.id);
    setEventStartTime(ev.startTime ? new Date(ev.startTime).toISOString().slice(0, 16) : '');
    setEventEndTime(ev.endTime ? new Date(ev.endTime).toISOString().slice(0, 16) : '');
    setEventUrlInput(ev.url || '');
  };

  const handleSaveEventTimer = async () => {
    if (!editingEventId) return;
    try {
      const startIso = eventStartTime ? new Date(eventStartTime).toISOString() : null;
      const endIso = eventEndTime ? new Date(eventEndTime).toISOString() : null;
      const currentStatus = eventControls.find((e: any) => e.id === editingEventId)?.status || 'Coming Soon';
      await setEventStatus(editingEventId, currentStatus, startIso, endIso);
      await setEventUrl(editingEventId, eventUrl.trim() || null);
      setEditingEventId(null);
    } catch (e: any) { alert(e.message || 'Failed to update event.'); }
  };

  const adminNavItems: NavMenuItem[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    {
      id: 'volunteers', label: 'Volunteers', icon: Users,
      badge: pendingVolunteers.length > 0 ? `+${pendingVolunteers.length}` : `${volunteerList.length}`,
      badgeColor: pendingVolunteers.length > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-[#050505] text-[#94a3b8]'
    },
    { id: 'teams', label: 'Teams', icon: Workflow, badge: `${teamList.length}`, badgeColor: 'bg-[#050505] text-[#94a3b8]' },
    { id: 'events', label: 'Event Controls', icon: Settings },
  ];

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#f2f2f2] font-mono flex flex-col md:flex-row overflow-x-hidden select-none">
      <CollapsibleSidebar
        title="ZERONE 7.0" roleTag="ADMIN" themeColor="purple"
        menuItems={adminNavItems} activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as any)}
        userName="Root Administrator" userEmail="admin@zerone.org" onLogout={logout}
      />

      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 sm:pb-8 max-w-7xl mx-auto w-full overflow-y-auto">

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <motion.div className="space-y-7" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[10px] font-mono text-[#7c3aed] uppercase tracking-widest mb-1">Admin Console</div>
                <h1 className="text-2xl font-black text-white uppercase font-mono">ZERONE 7.0 Command Centre</h1>
                <p className="text-[13px] text-[#94a3b8] mt-1 font-mono">IEEE Kidangoor · Full Access Control Panel</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono bg-[#0c0c10] border border-[#7c3aed]/35 rounded-xl px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#7c3aed] blink" />
                <span className="text-[#a78bfa] font-bold">ROOT ADMIN</span>
              </div>
            </div>

            {/* Pending Alert Banner */}
            {pendingVolunteers.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-amber-300 font-mono">{pendingVolunteers.length} Volunteer{pendingVolunteers.length > 1 ? 's' : ''} Pending Approval</div>
                    <div className="text-[11px] text-amber-400/80 mt-0.5 font-mono">New volunteers require authorization before portal access.</div>
                  </div>
                </div>
                <button onClick={() => setActiveTab('volunteers')} className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-1.5 rounded-xl text-xs transition-all shrink-0 font-mono">
                  Review Pending <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
                </button>
              </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Approved Volunteers', value: approvedVolunteers.length, sub: `${pendingVolunteers.length} pending`, color: 'text-[#00e5ff]', borderColor: '#00e5ff' },
                { label: 'Registered Teams', value: teamList.length, sub: 'Via volunteer QR scans', color: 'text-[#00e5ff]', borderColor: '#00e5ff' },
                { label: 'Active Events', value: activeEvents, sub: `${eventControls.length} total events`, color: 'text-[#a78bfa]', borderColor: '#7c3aed' },
                { label: 'Leaderboard #1', value: leaderboard[0] ? leaderboard[0].totalScore : 0, sub: leaderboard[0] ? leaderboard[0].teamName : 'No teams yet', color: 'text-amber-400', borderColor: '#f59e0b' },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  className="rounded-2xl border border-white/10 bg-[#0c0c10] p-5 space-y-2 corner-ticks"
                  style={{ borderTopColor: card.borderColor, borderTopWidth: '2px' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">{card.label}</div>
                  <AnimatedStat value={card.value} color={card.color} />
                  <div className="text-[11px] text-[#94a3b8] font-mono">{card.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Horizontal Roadmap Embedded on Dashboard */}
            <HorizontalRoadmap events={eventControls} />

            {/* Embedded Leaderboard */}
            <div className="rounded-2xl border border-white/10 bg-[#0c0c10] overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#7c3aed]" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono">Live Leaderboard</h3>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#00e5ff]">
                  <span className="h-2 w-2 rounded-full bg-[#10b981] blink" /> Live
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-mono">
                  <thead>
                    <tr className="bg-[#050505] border-b border-white/10 text-[10px] text-[#64748b] uppercase tracking-wider">
                      <th className="px-4 py-3 text-center">Rank</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3 hidden md:table-cell">Members</th>
                      <th className="px-4 py-3 text-center hidden sm:table-cell">Quiz</th>
                      <th className="px-4 py-3 text-center hidden sm:table-cell">Pitch</th>
                      <th className="px-4 py-3 text-center hidden sm:table-cell">Sell</th>
                      <th className="px-4 py-3 text-center hidden sm:table-cell">Hunt</th>
                      <th className="px-4 py-3 text-center hidden sm:table-cell">Bonus</th>
                      <th className="px-4 py-3 text-center hidden sm:table-cell">Penalty</th>
                      <th className="px-4 py-3 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {leaderboard.map((entry: any, i: number) => (
                      <tr key={entry.teamId} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-black text-xs ${entry.rank === 1 ? 'bg-amber-400 text-black' : entry.rank === 2 ? 'bg-slate-300 text-black' : entry.rank === 3 ? 'bg-amber-700 text-white' : 'bg-[#050505] text-[#94a3b8] border border-white/10'}`}>{entry.rank}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{entry.teamName}</div>
                          <div className="text-[10px] font-mono text-[#00e5ff]">{entry.teamId}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="text-[11px] text-[#94a3b8] truncate max-w-[160px]">{entry.members.join(', ') || 'None'}</div></td>
                        <td className="px-4 py-3 text-center text-[#94a3b8] hidden sm:table-cell">{entry.quiz}</td>
                        <td className="px-4 py-3 text-center text-[#94a3b8] hidden sm:table-cell">{entry.pitch}</td>
                        <td className="px-4 py-3 text-center text-[#94a3b8] hidden sm:table-cell">{entry.sell}</td>
                        <td className="px-4 py-3 text-center text-[#94a3b8] hidden sm:table-cell">{entry.treasureHunt}</td>
                        <td className="px-4 py-3 text-center text-emerald-400 hidden sm:table-cell">+{entry.bonus}</td>
                        <td className="px-4 py-3 text-center text-red-400 hidden sm:table-cell">-{entry.penalty}</td>
                        <td className="px-4 py-3 text-right"><span className="text-base font-black text-[#00e5ff]">{entry.totalScore}</span><span className="text-[10px] text-[#64748b] ml-0.5">pts</span></td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-[#94a3b8] text-sm">No teams on leaderboard yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── VOLUNTEERS ────────────────────────────────────────────────────── */}
        {activeTab === 'volunteers' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div>
              <h2 className="text-xl font-bold text-white uppercase font-mono">Volunteer Management</h2>
              <p className="text-[13px] text-[#94a3b8] mt-1 font-mono">Review pending registrations and manage approved volunteers.</p>
            </div>

            {/* Pending */}
            {pendingVolunteers.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 blink" />
                  Pending Approval ({pendingVolunteers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingVolunteers.map((vol: any) => (
                    <div key={vol.uid} className="rounded-2xl border border-amber-500/25 bg-[#0c0c10] p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 border border-amber-500/25 text-amber-400 font-bold text-sm">{vol.name.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{vol.name}</div>
                          <div className="text-[11px] text-[#00e5ff] font-mono mt-0.5">{vol.email}</div>
                          <div className="text-[11px] text-[#94a3b8] mt-0.5 font-mono">{vol.department} · {vol.phone}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 font-mono">
                        <button onClick={() => approveVolunteer(vol.uid)} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-400 font-bold py-2 rounded-xl text-xs transition-all">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button onClick={() => rejectVolunteer(vol.uid)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-2 rounded-xl text-xs transition-all">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono text-[#64748b] uppercase tracking-wider">Approved Volunteers ({approvedVolunteers.length})</h3>
              <div className="rounded-2xl border border-white/10 bg-[#0c0c10] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-mono">
                    <thead>
                      <tr className="bg-[#050505] border-b border-white/10 text-[10px] text-[#64748b] uppercase tracking-wider">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                        <th className="px-4 py-3 hidden md:table-cell">Department</th>
                        <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                        <th className="px-4 py-3">Join Code</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Team</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {approvedVolunteers.map((vol: any) => (
                        <tr key={vol.uid} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00e5ff]/12 border border-[#00e5ff]/25 text-[#00e5ff] font-bold text-xs">{vol.name.charAt(0)}</div>
                              <span className="font-semibold text-white">{vol.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-[#94a3b8] text-[12px]">{vol.email}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-[#94a3b8] text-[12px]">{vol.department}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-[#94a3b8] text-[12px]">{vol.phone}</td>
                          <td className="px-4 py-3 text-[#00e5ff] text-[12px] font-bold">{vol.joinCode}</td>
                          <td className="px-4 py-3 hidden sm:table-cell text-[12px]">{vol.assignedTeamId ? <span className="text-[#00e5ff] font-bold">{vol.assignedTeamId}</span> : <span className="text-[#64748b]">—</span>}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => deleteVolunteer(vol.uid)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors" title="Remove">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {approvedVolunteers.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-10 text-center text-[#94a3b8] text-sm">No approved volunteers.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TEAMS ─────────────────────────────────────────────────────────── */}
        {activeTab === 'teams' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white uppercase font-mono">Team Management</h2>
                <p className="text-[13px] text-[#94a3b8] mt-1 font-mono">Edit scores, names, and manage registered squads.</p>
              </div>
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search teams..."
                className="bg-[#0c0c10] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-[#7c3aed] outline-none w-full sm:w-72 font-mono"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamList
                .filter((t: any) => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((t: any) => (
                  <div key={t.id} className="rounded-2xl border border-white/10 bg-[#0c0c10] p-5 flex flex-col justify-between hover:border-[#7c3aed]/50 transition-all font-mono">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-[#00e5ff]">{t.id}</span>
                        <span className="text-xs font-black font-mono text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 px-2 py-0.5 rounded">{t.totalScore} pts</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{t.name}</h3>
                      <div className="text-[11px] text-[#94a3b8] mt-1">Volunteer: {t.volunteerName || 'Unassigned'}</div>
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="text-[10px] font-mono text-[#64748b] uppercase mb-1.5">Members ({t.members.length}):</div>
                        <div className="flex flex-wrap gap-1">
                          {t.members.map((m: any) => (
                            <span key={m.id} className="text-[10px] bg-[#050505] text-[#94a3b8] border border-white/10 px-2 py-0.5 rounded font-mono">{m.name}</span>
                          ))}
                          {t.members.length === 0 && <span className="text-[11px] text-[#64748b] italic">No members</span>}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
                        <div className="bg-[#050505] p-1.5 rounded border border-white/10">Quiz: <span className="text-white font-bold">{t.scores.quiz || 0}</span></div>
                        <div className="bg-[#050505] p-1.5 rounded border border-white/10">Pitch: <span className="text-white font-bold">{t.scores.pitch || 0}</span></div>
                        <div className="bg-[#050505] p-1.5 rounded border border-white/10">Sell: <span className="text-white font-bold">{t.scores.sell || 0}</span></div>
                        <div className="bg-[#050505] p-1.5 rounded border border-white/10">Hunt: <span className="text-white font-bold">{t.scores.treasureHunt || 0}</span></div>
                        <div className="bg-[#050505] p-1.5 rounded border border-white/10">Bonus: <span className="text-emerald-400 font-bold">+{t.scores.bonus || 0}</span></div>
                        <div className="bg-[#050505] p-1.5 rounded border border-white/10">Penalty: <span className="text-red-400 font-bold">-{t.scores.penalty || 0}</span></div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <button onClick={() => openEditTeamModal(t)} className="text-xs font-bold text-[#7c3aed] hover:text-[#a78bfa] flex items-center gap-1 transition-colors">
                        <Edit3 className="h-3.5 w-3.5" /> Edit Scores
                      </button>
                      <button onClick={() => deleteTeam(t.id)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              {teamList.length === 0 && (
                <div className="col-span-full py-16 text-center text-[#94a3b8] text-sm">No teams registered yet.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── EVENT CONTROLS ───────────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <motion.div className="space-y-7" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div>
              <h2 className="text-xl font-bold text-white uppercase font-mono">Event Controls</h2>
              <p className="text-[13px] text-[#94a3b8] mt-1 font-mono">Manage event status, timers, and external URLs.</p>
            </div>

            {/* Horizontal Roadmap at top */}
            <HorizontalRoadmap events={eventControls} />

            {/* Event Control Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
              {eventControls.map((ev: any) => (
                <div key={ev.id} className="rounded-2xl border border-white/10 bg-[#0c0c10] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <div className="text-[10px] font-mono text-[#7c3aed] uppercase tracking-wider font-bold">STAGE 0{ev.order}</div>
                      <h3 className="text-base font-bold text-white">{ev.name}</h3>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded font-mono uppercase ${ev.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : ev.status === 'Locked' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : ev.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                      {ev.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#94a3b8] leading-relaxed">{ev.description}</p>
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-[#64748b] uppercase">Set Status:</div>
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                      {(['Coming Soon', 'Active', 'Locked', 'Completed'] as const).map(st => (
                        <button key={st} onClick={() => setEventStatus(ev.id, st)} className={`py-2 rounded-lg border transition-all text-[11px] ${ev.status === st ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'bg-[#050505] text-[#94a3b8] border-white/10 hover:text-white hover:border-[#7c3aed]/50'}`}>
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {ev.isPaused ? (
                      <button onClick={() => resumeEvent(ev.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-2 rounded-xl text-xs transition-all">
                        <Play className="h-3.5 w-3.5" /> Resume Event
                      </button>
                    ) : (
                      <button onClick={() => pauseEvent(ev.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold py-2 rounded-xl text-xs transition-all">
                        <Pause className="h-3.5 w-3.5" /> Pause Event
                      </button>
                    )}
                    <button onClick={() => openEventTimerModal(ev)} className="bg-[#050505] hover:bg-white/10 border border-white/10 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all">
                      <Clock className="h-3.5 w-3.5" /> Configure
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </main>

      {/* Edit Team Modal */}
      {editingTeamId && (
        <div className="fixed inset-0 z-50 bg-[#050505]/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <motion.div className="bg-[#0c0c10] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 className="text-base font-bold text-white uppercase font-mono">Edit Team: {editingTeamId}</h3>
            <div>
              <label className="text-[11px] font-mono text-[#64748b] uppercase block mb-1.5">Team Name</label>
              <input type="text" value={editTeamName} onChange={e => setEditTeamName(e.target.value)} className="w-full bg-[#050505] border border-white/10 focus:border-[#7c3aed] rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm font-mono">
              {[
                { label: 'Quiz Marks', val: editQuiz, set: setEditQuiz },
                { label: 'Pitch Marks', val: editPitch, set: setEditPitch },
                { label: 'Sell Marks', val: editSell, set: setEditSell },
                { label: 'Treasure Marks', val: editTreasure, set: setEditTreasure },
                { label: 'Bonus Marks', val: editBonus, set: setEditBonus },
                { label: 'Penalty Marks', val: editPenalty, set: setEditPenalty },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-[11px] font-mono text-[#64748b] uppercase block mb-1">{field.label}</label>
                  <input type="number" value={field.val} onChange={e => field.set(Number(e.target.value))} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditingTeamId(null)} className="px-4 py-2 text-sm text-[#94a3b8] hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSaveTeamEdit} className="px-5 py-2 text-sm font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl transition-all">Save Changes</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Configure Event Modal */}
      {editingEventId && (
        <div className="fixed inset-0 z-50 bg-[#050505]/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <motion.div className="bg-[#0c0c10] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 className="text-base font-bold text-white uppercase font-mono">Configure Event: {editingEventId}</h3>
            <div>
              <label className="text-[11px] font-mono text-[#64748b] uppercase block mb-1.5">Start Time</label>
              <input type="datetime-local" value={eventStartTime} onChange={e => setEventStartTime(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-mono text-[#64748b] uppercase block mb-1.5">End Time</label>
              <input type="datetime-local" value={eventEndTime} onChange={e => setEventEndTime(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-mono text-[#64748b] uppercase block mb-1.5">External Event URL</label>
              <input type="url" value={eventUrl} onChange={e => setEventUrlInput(e.target.value)} placeholder="https://quiz.zerone.ieee.org" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditingEventId(null)} className="px-4 py-2 text-sm text-[#94a3b8] hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSaveEventTimer} className="px-5 py-2 text-sm font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl transition-all">Save Config</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
