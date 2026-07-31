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
      <div className="min-h-screen bg-[#101010] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8b949e] text-sm font-mono">Loading Admin Console...</p>
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
      badgeColor: pendingVolunteers.length > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-[#1a1a1a] text-[#8b949e]'
    },
    { id: 'teams', label: 'Teams', icon: Workflow, badge: `${teamList.length}`, badgeColor: 'bg-[#1a1a1a] text-[#8b949e]' },
    { id: 'events', label: 'Event Controls', icon: Settings },
  ];

  return (
    <div className="relative min-h-screen bg-[#101010] text-[#f5f6f7] flex flex-col md:flex-row overflow-x-hidden">
      <div className="noise" />
      <div className="mesh-blob w-[550px] h-[550px] bg-[#7c3aed]/20 top-[-10%] left-[-5%]" />
      <div className="mesh-blob w-[650px] h-[650px] bg-[#3d3a39]/20 top-[35%] right-[-10%]" />
      <div className="mesh-blob w-[500px] h-[500px] bg-[#00d992]/12 bottom-[-5%] left-[20%]" />

      <CollapsibleSidebar
        title="ZERONE 7.0" roleTag="ADMIN" themeColor="purple"
        menuItems={adminNavItems} activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as any)}
        userName="Root Administrator" userEmail="admin@zerone.org" onLogout={logout}
      />

      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 sm:pb-8 max-w-7xl mx-auto w-full overflow-y-auto">

        {/* â”€â”€ OVERVIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'overview' && (
          <motion.div className="space-y-7" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[10px] font-mono text-[#7c3aed] uppercase tracking-widest mb-1">Admin Console</div>
                <h1 className="text-2xl text-white heading">ZERONE 7.0 Command Centre</h1>
                <p className="text-[13px] text-[#8b949e] mt-1 body-text">IEEE Kidangoor Â· Full Access Control Panel</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono bg-[#1a1a1a] border border-[#7c3aed]/35 rounded-xl px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#7c3aed] animate-pulse" />
                <span className="text-[#a78bfa] font-bold">ROOT ADMIN</span>
              </div>
            </div>

            {/* Pending Alert Banner */}
            {pendingVolunteers.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-amber-300 heading">{pendingVolunteers.length} Volunteer{pendingVolunteers.length > 1 ? 's' : ''} Pending Approval</div>
                    <div className="text-[11px] text-amber-400/80 mt-0.5 body-text">New volunteers require authorization before portal access.</div>
                  </div>
                </div>
                <button onClick={() => setActiveTab('volunteers')} className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-1.5 rounded-xl text-xs transition-all shrink-0 body-text">
                  Review Pending <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
                </button>
              </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Approved Volunteers', value: approvedVolunteers.length, sub: `${pendingVolunteers.length} pending`, color: 'text-[#00d992]', borderColor: '#00d992' },
                { label: 'Registered Teams', value: teamList.length, sub: 'Via volunteer QR scans', color: 'text-[#00d992]', borderColor: '#00d992' },
                { label: 'Active Events', value: activeEvents, sub: `${eventControls.length} total events`, color: 'text-[#a78bfa]', borderColor: '#7c3aed' },
                { label: 'Leaderboard #1', value: leaderboard[0] ? leaderboard[0].totalScore : 0, sub: leaderboard[0] ? leaderboard[0].teamName : 'No teams yet', color: 'text-amber-400', borderColor: '#f59e0b' },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 space-y-2 premium-card"
                  style={{ borderTopColor: card.borderColor, borderTopWidth: '2px' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">{card.label}</div>
                  <AnimatedStat value={card.value} color={card.color} />
                  <div className="text-[11px] text-[#8b949e] body-text">{card.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Horizontal Roadmap Embedded on Dashboard */}
            <HorizontalRoadmap events={eventControls} />

            {/* Embedded Leaderboard */}
            <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[#3d3a39]/60">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#7c3aed]" />
                  <h3 className="text-sm font-semibold text-white heading">Live Leaderboard</h3>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#00d992]">
                  <span className="h-2 w-2 rounded-full bg-[#00d992] animate-pulse" /> Live
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#1a1a1a] border-b border-[#3d3a39] text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">
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
                  <tbody className="divide-y divide-[#3d3a39]/60">
                    {leaderboard.map((entry: any, i: number) => (
                      <motion.tr key={entry.teamId} className="hover:bg-[#1a1a1a] transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-black text-xs ${entry.rank === 1 ? 'rank-gold' : entry.rank === 2 ? 'rank-silver' : entry.rank === 3 ? 'rank-bronze' : 'bg-[#1a1a1a] text-[#8b949e] border border-[#3d3a39]'}`}>{entry.rank}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white body-text">{entry.teamName}</div>
                          <div className="text-[10px] font-mono text-[#00d992]">{entry.teamId}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="text-[11px] text-[#8b949e] body-text truncate max-w-[160px]">{entry.members.join(', ') || 'None'}</div></td>
                        <td className="px-4 py-3 text-center text-[#8b949e] hidden sm:table-cell body-text">{entry.quiz}</td>
                        <td className="px-4 py-3 text-center text-[#8b949e] hidden sm:table-cell body-text">{entry.pitch}</td>
                        <td className="px-4 py-3 text-center text-[#8b949e] hidden sm:table-cell body-text">{entry.sell}</td>
                        <td className="px-4 py-3 text-center text-[#8b949e] hidden sm:table-cell body-text">{entry.treasureHunt}</td>
                        <td className="px-4 py-3 text-center text-green-400 hidden sm:table-cell body-text">+{entry.bonus}</td>
                        <td className="px-4 py-3 text-center text-red-400 hidden sm:table-cell body-text">-{entry.penalty}</td>
                        <td className="px-4 py-3 text-right"><span className="text-base font-black text-[#00d992] heading">{entry.totalScore}</span><span className="text-[10px] text-[#8b949e] font-mono ml-0.5">pts</span></td>
                      </motion.tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-[#8b949e] text-sm body-text">No teams on leaderboard yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* â”€â”€ VOLUNTEERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'volunteers' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div>
              <h2 className="text-xl font-bold text-white heading">Volunteer Management</h2>
              <p className="text-[13px] text-[#8b949e] mt-1 body-text">Review pending registrations and manage approved volunteers.</p>
            </div>

            {/* Pending */}
            {pendingVolunteers.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  Pending Approval ({pendingVolunteers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingVolunteers.map((vol: any) => (
                    <div key={vol.uid} className="rounded-2xl border border-amber-500/25 bg-[#1a1a1a] p-4 space-y-3 premium-card">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 border border-amber-500/25 text-amber-400 font-bold text-sm heading">{vol.name.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white heading truncate">{vol.name}</div>
                          <div className="text-[11px] text-[#00d992] font-mono mt-0.5">{vol.email}</div>
                          <div className="text-[11px] text-[#8b949e] mt-0.5 body-text">{vol.department} Â· {vol.phone}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approveVolunteer(vol.uid)} className="flex-1 flex items-center justify-center gap-1.5 bg-[#34d399]/12 hover:bg-[#34d399]/20 border border-[#34d399]/35 text-[#34d399] font-bold py-2 rounded-xl text-xs transition-all body-text">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button onClick={() => rejectVolunteer(vol.uid)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/18 border border-red-500/30 text-red-400 font-bold py-2 rounded-xl text-xs transition-all body-text">
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
              <h3 className="text-xs font-mono text-[#8b949e] uppercase tracking-wider">Approved Volunteers ({approvedVolunteers.length})</h3>
              <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#1a1a1a] border-b border-[#3d3a39] text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                        <th className="px-4 py-3 hidden md:table-cell">Department</th>
                        <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                        <th className="px-4 py-3">Join Code</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Team</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3d3a39]/60">
                      {approvedVolunteers.map((vol: any) => (
                        <tr key={vol.uid} className="hover:bg-[#1a1a1a] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00d992]/12 border border-[#00d992]/25 text-[#00d992] font-bold text-xs font-mono">{vol.name.charAt(0)}</div>
                              <span className="font-semibold text-white body-text">{vol.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-[#8b949e] text-[12px] body-text">{vol.email}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-[#8b949e] text-[12px] body-text">{vol.department}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-[#8b949e] text-[12px] font-mono">{vol.phone}</td>
                          <td className="px-4 py-3 text-[#00d992] font-mono text-[12px]">{vol.joinCode}</td>
                          <td className="px-4 py-3 hidden sm:table-cell text-[12px] body-text">{vol.assignedTeamId ? <span className="text-[#00d992] font-mono">{vol.assignedTeamId}</span> : <span className="text-[#3d3a39]">â€”</span>}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => deleteVolunteer(vol.uid)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors" title="Remove">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {approvedVolunteers.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-10 text-center text-[#8b949e] text-sm body-text">No approved volunteers.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* â”€â”€ TEAMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'teams' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white heading">Team Management</h2>
                <p className="text-[13px] text-[#8b949e] mt-1 body-text">Edit scores, names, and manage registered squads.</p>
              </div>
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search teams..."
                className="bg-[#1a1a1a] border border-[#3d3a39] rounded-xl px-4 py-2 text-sm text-white placeholder-[#3d3a39] focus:border-[#7c3aed] outline-none w-full sm:w-72 body-text"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamList
                .filter((t: any) => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((t: any) => (
                  <div key={t.id} className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 flex flex-col justify-between hover:border-[#7c3aed]/50 transition-all premium-card">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-[#00d992]">{t.id}</span>
                        <span className="text-xs font-black font-mono text-[#00d992] bg-[#00d992]/10 border border-[#00d992]/30 px-2 py-0.5 rounded">{t.totalScore} pts</span>
                      </div>
                      <h3 className="text-base font-bold text-white heading">{t.name}</h3>
                      <div className="text-[11px] text-[#8b949e] mt-1 body-text">Volunteer: {t.volunteerName || 'Unassigned'}</div>
                      <div className="mt-3 pt-3 border-t border-[#3d3a39]/60">
                        <div className="text-[10px] font-mono text-[#3d3a39] uppercase mb-1.5">Members ({t.members.length}):</div>
                        <div className="flex flex-wrap gap-1">
                          {t.members.map((m: any) => (
                            <span key={m.id} className="text-[10px] bg-[#1a1a1a] text-[#8b949e] border border-[#3d3a39] px-2 py-0.5 rounded font-mono">{m.name}</span>
                          ))}
                          {t.members.length === 0 && <span className="text-[11px] text-[#3d3a39] body-text italic">No members</span>}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
                        <div className="bg-[#1a1a1a] p-1.5 rounded border border-[#3d3a39]">Quiz: <span className="text-white font-bold">{t.scores.quiz || 0}</span></div>
                        <div className="bg-[#1a1a1a] p-1.5 rounded border border-[#3d3a39]">Pitch: <span className="text-white font-bold">{t.scores.pitch || 0}</span></div>
                        <div className="bg-[#1a1a1a] p-1.5 rounded border border-[#3d3a39]">Sell: <span className="text-white font-bold">{t.scores.sell || 0}</span></div>
                        <div className="bg-[#1a1a1a] p-1.5 rounded border border-[#3d3a39]">Hunt: <span className="text-white font-bold">{t.scores.treasureHunt || 0}</span></div>
                        <div className="bg-[#1a1a1a] p-1.5 rounded border border-[#3d3a39]">Bonus: <span className="text-green-400 font-bold">+{t.scores.bonus || 0}</span></div>
                        <div className="bg-[#1a1a1a] p-1.5 rounded border border-[#3d3a39]">Penalty: <span className="text-red-400 font-bold">-{t.scores.penalty || 0}</span></div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#3d3a39]/60 flex items-center justify-between">
                      <button onClick={() => openEditTeamModal(t)} className="text-xs font-bold text-[#7c3aed] hover:text-[#a78bfa] flex items-center gap-1 body-text transition-colors">
                        <Edit3 className="h-3.5 w-3.5" /> Edit Scores
                      </button>
                      <button onClick={() => deleteTeam(t.id)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              {teamList.length === 0 && (
                <div className="col-span-full py-16 text-center text-[#8b949e] text-sm body-text">No teams registered yet.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* â”€â”€ EVENT CONTROLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'events' && (
          <motion.div className="space-y-7" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div>
              <h2 className="text-xl font-bold text-white heading">Event Controls</h2>
              <p className="text-[13px] text-[#8b949e] mt-1 body-text">Manage event status, timers, and external URLs.</p>
            </div>

            {/* Horizontal Roadmap at top */}
            <HorizontalRoadmap events={eventControls} />

            {/* Event Control Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {eventControls.map((ev: any) => (
                <div key={ev.id} className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#3d3a39]/60 pb-4">
                    <div>
                      <div className="text-[10px] font-mono text-[#7c3aed] uppercase tracking-wider font-bold">STAGE 0{ev.order}</div>
                      <h3 className="text-base font-bold text-white heading">{ev.name}</h3>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded font-mono uppercase ${ev.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : ev.status === 'Locked' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : ev.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                      {ev.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#8b949e] leading-relaxed body-text">{ev.description}</p>
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-[#3d3a39] uppercase">Set Status:</div>
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                      {(['Coming Soon', 'Active', 'Locked', 'Completed'] as const).map(st => (
                        <button key={st} onClick={() => setEventStatus(ev.id, st)} className={`py-2 rounded-lg border transition-all text-[11px] ${ev.status === st ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'bg-[#1a1a1a] text-[#8b949e] border-[#3d3a39] hover:text-white hover:border-[#7c3aed]/50'}`}>
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {ev.isPaused ? (
                      <button onClick={() => resumeEvent(ev.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 hover:bg-green-500/18 border border-green-500/30 text-green-400 font-bold py-2 rounded-xl text-xs transition-all body-text">
                        <Play className="h-3.5 w-3.5" /> Resume Event
                      </button>
                    ) : (
                      <button onClick={() => pauseEvent(ev.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/18 border border-amber-500/30 text-amber-400 font-bold py-2 rounded-xl text-xs transition-all body-text">
                        <Pause className="h-3.5 w-3.5" /> Pause Event
                      </button>
                    )}
                    <button onClick={() => openEventTimerModal(ev)} className="bg-[#1a1a1a] hover:bg-[#3d3a39] border border-[#3d3a39] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all body-text">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div className="bg-[#1a1a1a] border border-[#3d3a39] rounded-2xl max-w-md w-full p-6 space-y-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 className="text-base font-bold text-white heading">Edit Team: {editingTeamId}</h3>
            <div>
              <label className="text-[11px] font-mono text-[#8b949e] uppercase block mb-1.5">Team Name</label>
              <input type="text" value={editTeamName} onChange={e => setEditTeamName(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#3d3a39] focus:border-[#7c3aed] rounded-xl px-4 py-2.5 text-sm text-white outline-none body-text" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Quiz Marks', val: editQuiz, set: setEditQuiz },
                { label: 'Pitch Marks', val: editPitch, set: setEditPitch },
                { label: 'Sell Marks', val: editSell, set: setEditSell },
                { label: 'Treasure Marks', val: editTreasure, set: setEditTreasure },
                { label: 'Bonus Marks', val: editBonus, set: setEditBonus },
                { label: 'Penalty Marks', val: editPenalty, set: setEditPenalty },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-[11px] font-mono text-[#8b949e] uppercase block mb-1">{field.label}</label>
                  <input type="number" value={field.val} onChange={e => field.set(Number(e.target.value))} className="w-full bg-[#1a1a1a] border border-[#3d3a39] rounded-xl px-3 py-2 text-white text-sm outline-none body-text" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditingTeamId(null)} className="px-4 py-2 text-sm text-[#8b949e] hover:text-white transition-colors body-text">Cancel</button>
              <button onClick={handleSaveTeamEdit} className="px-5 py-2 text-sm font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl transition-all body-text">Save Changes</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Configure Event Modal */}
      {editingEventId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div className="bg-[#1a1a1a] border border-[#3d3a39] rounded-2xl max-w-md w-full p-6 space-y-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 className="text-base font-bold text-white heading">Configure Event: {editingEventId}</h3>
            <div>
              <label className="text-[11px] font-mono text-[#8b949e] uppercase block mb-1.5">Start Time</label>
              <input type="datetime-local" value={eventStartTime} onChange={e => setEventStartTime(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#3d3a39] rounded-xl px-4 py-2.5 text-sm text-white outline-none body-text" />
            </div>
            <div>
              <label className="text-[11px] font-mono text-[#8b949e] uppercase block mb-1.5">End Time</label>
              <input type="datetime-local" value={eventEndTime} onChange={e => setEventEndTime(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#3d3a39] rounded-xl px-4 py-2.5 text-sm text-white outline-none body-text" />
            </div>
            <div>
              <label className="text-[11px] font-mono text-[#8b949e] uppercase block mb-1.5">External Event URL</label>
              <input type="url" value={eventUrl} onChange={e => setEventUrlInput(e.target.value)} placeholder="https://quiz.zerone.ieee.org" className="w-full bg-[#1a1a1a] border border-[#3d3a39] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#3d3a39] outline-none body-text" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditingEventId(null)} className="px-4 py-2 text-sm text-[#8b949e] hover:text-white transition-colors body-text">Cancel</button>
              <button onClick={handleSaveEventTimer} className="px-5 py-2 text-sm font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl transition-all body-text">Save Config</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
