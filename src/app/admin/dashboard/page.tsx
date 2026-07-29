'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';
import Terminal from '@/components/ui/Terminal';
import { buildLeaderboard } from '@/lib/leaderboard';
import CollapsibleSidebar from '@/components/layout/CollapsibleSidebar';
import { NavMenuItem } from '@/components/layout/CollapsibleSidebar';
import CandyRoadmap from '@/components/features/CandyRoadmap';
import {
  Shield, Users, Workflow, Trophy, Settings, LogOut, CheckCircle2,
  Play, Pause, Clock, Edit3, Trash2, ShieldAlert, Activity,
  FileText, Send, ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const {
    currentUser, isLoading, volunteers, teams, eventControls, auditLogs, logout,
    approveVolunteer, rejectVolunteer, deleteVolunteer,
    updateTeamName, deleteTeam, updateTeamScore, adjustBonus,
    setEventStatus, pauseEvent, resumeEvent, setEventUrl,
    broadcastAnnouncement,
  } = useZerone();

  const [activeTab, setActiveTab] = useState<'overview' | 'volunteers' | 'teams' | 'events' | 'leaderboard' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  // Edit team modal state
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editQuiz, setEditQuiz] = useState(0);
  const [editPitch, setEditPitch] = useState(0);
  const [editSell, setEditSell] = useState(0);
  const [editTreasure, setEditTreasure] = useState(0);
  const [editBonus, setEditBonus] = useState(0);
  const [editPenalty, setEditPenalty] = useState(0);

  // Event timer modal
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventUrl, setEventUrlInput] = useState('');

  // Route guard
  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#888] font-mono text-xs">
        Loading ZERONE 7.0 Admin Control Console...
      </div>
    );
  }

  const volunteerList = Object.values(volunteers);
  const teamList = Object.values(teams);
  const leaderboard = buildLeaderboard(teams);

  const pendingVolunteers = volunteerList.filter((v) => v.status === 'pending');
  const approvedVolunteers = volunteerList.filter((v) => v.status === 'approved');

  const openEditTeamModal = (t: typeof teamList[0]) => {
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
    } catch (e: any) {
      alert(e.message || 'Failed to update team details');
    }
  };

  const openEventTimerModal = (ev: typeof eventControls[0]) => {
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
      const currentStatus = eventControls.find(e => e.id === editingEventId)?.status || 'Coming Soon';
      await setEventStatus(editingEventId, currentStatus, startIso, endIso);
      await setEventUrl(editingEventId, eventUrl.trim() || null);
      setEditingEventId(null);
    } catch (e: any) {
      alert(e.message || 'Failed to update event control');
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementBody.trim()) return;
    await broadcastAnnouncement(announcementTitle.trim(), announcementBody.trim(), 'global');
    setAnnouncementTitle('');
    setAnnouncementBody('');
    setAnnouncementSent(true);
    setTimeout(() => setAnnouncementSent(false), 3000);
  };

  const adminNavItems: NavMenuItem[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    {
      id: 'volunteers',
      label: 'Volunteers',
      icon: Users,
      badge: pendingVolunteers.length > 0 ? `+${pendingVolunteers.length}` : `${volunteerList.length}`,
      badgeColor: pendingVolunteers.length > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-[#222] text-[#888]'
    },
    { id: 'teams', label: 'Teams', icon: Workflow, badge: `${teamList.length}`, badgeColor: 'bg-[#222] text-[#888]' },
    { id: 'events', label: 'Event Controls', icon: Settings },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'reports', label: 'Broadcast', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f2f2f2] font-sans flex flex-row">
      {/* Collapsible Minimizable Left Sidebar */}
      <CollapsibleSidebar
        title="IEEE ZERONE"
        roleTag="ADMIN"
        themeColor="purple"
        menuItems={adminNavItems}
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as any)}
        userName="Root Administrator"
        userEmail="admin@zerone.org"
        onLogout={logout}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* =========================================================
            TAB 1: OVERVIEW
            ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Pending Alert Banner */}
            {pendingVolunteers.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-amber-300">
                      {pendingVolunteers.length} Volunteer Registration{pendingVolunteers.length > 1 ? 's' : ''} Pending Approval
                    </div>
                    <div className="text-[11px] text-amber-400/80 mt-0.5">
                      New volunteers require your authorization before accessing the Volunteer Portal.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('volunteers')}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-1.5 rounded-lg text-xs transition-all shrink-0 font-mono"
                >
                  Review Pending →
                </button>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-[#262626] bg-[#111] p-5">
                <div className="text-[10px] font-mono text-[#666] uppercase tracking-wider">Approved Volunteers</div>
                <div className="text-3xl font-black text-[#00e5ff] font-mono mt-2">{approvedVolunteers.length}</div>
                <div className="text-[10px] text-[#555] mt-1">{pendingVolunteers.length} pending approval</div>
              </div>
              <div className="rounded-xl border border-[#262626] bg-[#111] p-5">
                <div className="text-[10px] font-mono text-[#666] uppercase tracking-wider">Registered Teams</div>
                <div className="text-3xl font-black text-[#00d992] font-mono mt-2">{teamList.length}</div>
                <div className="text-[10px] text-[#555] mt-1">Formed via volunteer QR scans</div>
              </div>
              <div className="rounded-xl border border-[#262626] bg-[#111] p-5">
                <div className="text-[10px] font-mono text-[#666] uppercase tracking-wider">Event Roadmaps</div>
                <div className="text-3xl font-black text-[#7c3aed] font-mono mt-2">{eventControls.length}</div>
                <div className="text-[10px] text-[#555] mt-1">Independent event websites</div>
              </div>
              <div className="rounded-xl border border-[#262626] bg-[#111] p-5">
                <div className="text-[10px] font-mono text-[#666] uppercase tracking-wider">Leaderboard #1</div>
                <div className="text-xl font-bold text-white font-mono mt-2 truncate">
                  {leaderboard[0] ? leaderboard[0].teamName : 'No teams yet'}
                </div>
                <div className="text-[10px] text-amber-400 mt-1 font-mono">
                  {leaderboard[0] ? `${leaderboard[0].totalScore} pts` : '—'}
                </div>
              </div>
            </div>

            {/* Event Status Cards */}
            <div>
              <h3 className="text-xs font-mono font-bold text-[#888] uppercase tracking-wider mb-3">
                Event Roadmap Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {eventControls.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-[#262626] bg-[#111] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white font-mono">{ev.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                          ev.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                          ev.status === 'Locked' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                          ev.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {ev.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666] leading-relaxed line-clamp-2">{ev.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between text-[10px] text-[#555] font-mono">
                      <span>{ev.isPaused ? '⏸ PAUSED' : '▶ RUNNING'}</span>
                      <button onClick={() => openEventTimerModal(ev)} className="text-[#7c3aed] hover:underline font-bold">Config →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Log Stream */}
            <div>
              <h3 className="text-xs font-mono font-bold text-[#888] uppercase tracking-wider mb-3">
                Real-time System Audit Stream
              </h3>
              <Terminal logs={auditLogs} className="h-[320px]" title="zerone_admin / system_audit_stream" />
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: VOLUNTEERS
            ========================================================= */}
        {activeTab === 'volunteers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase font-mono">Volunteer Management</h2>
                <p className="text-xs text-[#666]">Approve, reject, or assign registered volunteers.</p>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search volunteers by name, email, dept..."
                className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#7c3aed] outline-none w-full sm:w-72 font-mono"
              />
            </div>

            {/* Pending Volunteers Section */}
            {pendingVolunteers.length > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-[#111] p-6 space-y-4">
                <h3 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Pending Approval ({pendingVolunteers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingVolunteers.map((vol) => (
                    <div key={vol.uid} className="rounded-xl border border-[#2a2a2a] bg-[#0a0a0b] p-4 flex flex-col justify-between font-mono">
                      <div>
                        <div className="text-sm font-bold text-white">{vol.name}</div>
                        <div className="text-xs text-[#777] mt-0.5">{vol.email}</div>
                        <div className="text-xs text-[#555] mt-1">📞 {vol.phone} · 🏫 {vol.department}</div>
                        <div className="text-[10px] text-amber-400/70 mt-2">Code: {vol.joinCode}</div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#222] flex items-center gap-2">
                        <button
                          onClick={() => approveVolunteer(vol.uid)}
                          className="flex-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => rejectVolunteer(vol.uid)}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold px-3 py-1.5 rounded-lg text-xs transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Volunteers Table */}
            <div className="rounded-2xl border border-[#262626] bg-[#111] overflow-hidden">
              <div className="p-4 border-b border-[#222] text-xs font-bold font-mono text-[#888] uppercase tracking-wider">
                Approved Volunteers ({approvedVolunteers.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0a0a0b] text-[#555] border-b border-[#222] uppercase">
                    <tr>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Phone</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Join Code</th>
                      <th className="p-3.5">Assigned Team</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222] text-[#ccc]">
                    {approvedVolunteers
                      .filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.email.toLowerCase().includes(searchTerm.toLowerCase()) || v.department.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((vol) => (
                        <tr key={vol.uid} className="hover:bg-[#161618] transition-colors">
                          <td className="p-3.5 font-bold text-white">{vol.name}</td>
                          <td className="p-3.5 text-[#888]">{vol.email}</td>
                          <td className="p-3.5 text-[#888]">{vol.phone}</td>
                          <td className="p-3.5">{vol.department}</td>
                          <td className="p-3.5 text-[#00e5ff]">{vol.joinCode}</td>
                          <td className="p-3.5 text-[#00d992]">{vol.assignedTeamId || 'Unassigned'}</td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => deleteVolunteer(vol.uid)}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                              title="Remove Volunteer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {approvedVolunteers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#555] italic">No approved volunteers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: TEAMS
            ========================================================= */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase font-mono">Team Management</h2>
                <p className="text-xs text-[#666]">View team details, members, edit bonus/penalty, or update names.</p>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search teams by ID, name, members..."
                className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#7c3aed] outline-none w-full sm:w-72 font-mono"
              />
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
              {teamList
                .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((t) => (
                  <div key={t.id} className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-5 flex flex-col justify-between hover:border-[#7c3aed]/50 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-[#00e5ff]">{t.id}</span>
                        <span className="text-xs font-black font-mono text-[#00d992] bg-[#00d992]/10 border border-[#00d992]/30 px-2 py-0.5 rounded">
                          {t.totalScore} pts
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white">{t.name}</h3>
                      <div className="text-xs text-[#666] mt-1 font-mono">Volunteer: {t.volunteerName || 'Unassigned'}</div>

                      {/* Members list preview */}
                      <div className="mt-4 pt-3 border-t border-[#222]">
                        <div className="text-[10px] font-mono text-[#555] uppercase mb-1">Members ({t.members.length}):</div>
                        <div className="flex flex-wrap gap-1">
                          {t.members.map((m) => (
                            <span key={m.id} className="text-[10px] bg-[#1a1a1a] text-[#aaa] border border-[#2a2a2a] px-2 py-0.5 rounded font-mono">
                              {m.name} ({m.department})
                            </span>
                          ))}
                          {t.members.length === 0 && <span className="text-xs text-[#555] italic">No members added</span>}
                        </div>
                      </div>

                      {/* Score breakdown preview */}
                      <div className="mt-4 grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
                        <div className="bg-[#0a0a0b] p-1.5 rounded border border-[#222]">Quiz: <span className="text-white font-bold">{t.scores.quiz || 0}</span></div>
                        <div className="bg-[#0a0a0b] p-1.5 rounded border border-[#222]">Pitch: <span className="text-white font-bold">{t.scores.pitch || 0}</span></div>
                        <div className="bg-[#0a0a0b] p-1.5 rounded border border-[#222]">Sell: <span className="text-white font-bold">{t.scores.sell || 0}</span></div>
                        <div className="bg-[#0a0a0b] p-1.5 rounded border border-[#222]">Treasure: <span className="text-white font-bold">{t.scores.treasureHunt || 0}</span></div>
                        <div className="bg-[#0a0a0b] p-1.5 rounded border border-[#222]">Bonus: <span className="text-green-400 font-bold">+{t.scores.bonus || 0}</span></div>
                        <div className="bg-[#0a0a0b] p-1.5 rounded border border-[#222]">Penalty: <span className="text-red-400 font-bold">-{t.scores.penalty || 0}</span></div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#222] flex items-center justify-between">
                      <button
                        onClick={() => openEditTeamModal(t)}
                        className="text-xs font-bold font-mono text-[#7c3aed] hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit Scores & Name
                      </button>
                      <button
                        onClick={() => deleteTeam(t.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                        title="Delete Team"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              {teamList.length === 0 && (
                <div className="col-span-full p-12 text-center text-[#555] font-mono italic">
                  No teams registered yet. Volunteers will register teams after scanning member QR codes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: EVENT ROADMAP & CONTROLS
            ========================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <CandyRoadmap events={eventControls} />

            <div>
              <h2 className="text-lg font-black text-white uppercase font-mono">Event Control Console</h2>
              <p className="text-xs text-[#666]">Control access status, pause/resume execution, set timers, and configure URLs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventControls.map((ev) => (
                <div key={ev.id} className="rounded-2xl border border-[#2a2a2a] bg-[#111] p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-[#222] pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#7c3aed] uppercase tracking-wider font-bold">STAGE 0{ev.order}</span>
                      <h3 className="text-lg font-black text-white">{ev.name}</h3>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded font-mono uppercase ${
                      ev.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                      ev.status === 'Locked' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                      ev.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {ev.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#777] leading-relaxed">{ev.description}</p>

                  {/* Status Toggle Buttons */}
                  <div className="space-y-2 font-mono">
                    <div className="text-[10px] text-[#555] uppercase">Set Status:</div>
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                      {(['Coming Soon', 'Active', 'Locked', 'Completed'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setEventStatus(ev.id, st)}
                          className={`py-2 rounded border transition-all text-[11px] ${
                            ev.status === st
                              ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                              : 'bg-[#0a0a0b] text-[#777] border-[#222] hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pause / Resume / Lock Controls */}
                  <div className="flex items-center gap-2 pt-2">
                    {ev.isPaused ? (
                      <button
                        onClick={() => resumeEvent(ev.id)}
                        className="flex-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Play className="h-3.5 w-3.5" /> Resume Event
                      </button>
                    ) : (
                      <button
                        onClick={() => pauseEvent(ev.id)}
                        className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold py-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Pause className="h-3.5 w-3.5" /> Pause Event
                      </button>
                    )}

                    <button
                      onClick={() => openEventTimerModal(ev)}
                      className="bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white font-bold px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all"
                    >
                      <Clock className="h-3.5 w-3.5" /> Configure Timer & URL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: LEADERBOARD
            ========================================================= */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white uppercase font-mono">Central Leaderboard</h2>
                <p className="text-xs text-[#666]">Automatically aggregated from scores submitted by independent event websites.</p>
              </div>
              <div className="text-xs font-mono text-[#00d992] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Auto-Refreshed
              </div>
            </div>

            <div className="rounded-2xl border border-[#262626] bg-[#111] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0a0a0b] text-[#555] border-b border-[#222] uppercase">
                    <tr>
                      <th className="p-3.5 text-center">Rank</th>
                      <th className="p-3.5">Team Name</th>
                      <th className="p-3.5">Team ID</th>
                      <th className="p-3.5">Members</th>
                      <th className="p-3.5 text-center">Quiz</th>
                      <th className="p-3.5 text-center">Pitch</th>
                      <th className="p-3.5 text-center">Sell</th>
                      <th className="p-3.5 text-center">Treasure</th>
                      <th className="p-3.5 text-center">Bonus</th>
                      <th className="p-3.5 text-center">Penalty</th>
                      <th className="p-3.5 text-right">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222] text-[#ccc]">
                    {leaderboard.map((entry) => (
                      <tr key={entry.teamId} className="hover:bg-[#161618] transition-colors">
                        <td className="p-3.5 text-center">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-black text-xs ${
                            entry.rank === 1 ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.5)]' :
                            entry.rank === 2 ? 'bg-gray-300 text-black' :
                            entry.rank === 3 ? 'bg-amber-700 text-white' :
                            'bg-[#1a1a1a] text-[#888]'
                          }`}>
                            {entry.rank}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white">{entry.teamName}</td>
                        <td className="p-3.5 text-[#00e5ff]">{entry.teamId}</td>
                        <td className="p-3.5 text-[#888]">{entry.members.join(', ') || 'None'}</td>
                        <td className="p-3.5 text-center text-[#888]">{entry.quiz}</td>
                        <td className="p-3.5 text-center text-[#888]">{entry.pitch}</td>
                        <td className="p-3.5 text-center text-[#888]">{entry.sell}</td>
                        <td className="p-3.5 text-center text-[#888]">{entry.treasureHunt}</td>
                        <td className="p-3.5 text-center text-green-400">+{entry.bonus}</td>
                        <td className="p-3.5 text-center text-red-400">-{entry.penalty}</td>
                        <td className="p-3.5 text-right font-black text-lg text-[#00d992]">{entry.totalScore}</td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-[#555] italic">No teams on leaderboard yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 6: REPORTS & BROADCAST
            ========================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-8 font-mono">
            {/* Announcement Broadcast Form */}
            <div className="rounded-2xl border border-[#262626] bg-[#111] p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Send className="h-4 w-4 text-[#7c3aed]" />
                Broadcast System Announcement
              </h3>
              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Title</label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="e.g. Stage 2 Quiz Unlocked!"
                    className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#7c3aed] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Body</label>
                  <textarea
                    value={announcementBody}
                    onChange={(e) => setAnnouncementBody(e.target.value)}
                    rows={3}
                    placeholder="Enter message details for all volunteers and users..."
                    className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#7c3aed] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all"
                >
                  Send Global Announcement
                </button>
                {announcementSent && (
                  <span className="text-xs text-green-400 ml-3">✓ Announcement Broadcasted!</span>
                )}
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Edit Team Modal */}
      {editingTeamId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white">Edit Team: {editingTeamId}</h3>
            <div>
              <label className="text-[10px] font-mono text-[#888] uppercase block mb-1">Team Name</label>
              <input
                type="text"
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-1">Quiz Marks</label>
                <input type="number" value={editQuiz} onChange={(e) => setEditQuiz(Number(e.target.value))} className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded px-3 py-1.5 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-1">Pitch Marks</label>
                <input type="number" value={editPitch} onChange={(e) => setEditPitch(Number(e.target.value))} className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded px-3 py-1.5 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-1">Sell Marks</label>
                <input type="number" value={editSell} onChange={(e) => setEditSell(Number(e.target.value))} className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded px-3 py-1.5 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-1">Treasure Marks</label>
                <input type="number" value={editTreasure} onChange={(e) => setEditTreasure(Number(e.target.value))} className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded px-3 py-1.5 text-white" />
              </div>
              <div>
                <label className="text-[10px] text-green-400 uppercase block mb-1">Bonus Marks</label>
                <input type="number" value={editBonus} onChange={(e) => setEditBonus(Number(e.target.value))} className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded px-3 py-1.5 text-green-400 font-bold" />
              </div>
              <div>
                <label className="text-[10px] text-red-400 uppercase block mb-1">Penalty Marks</label>
                <input type="number" value={editPenalty} onChange={(e) => setEditPenalty(Number(e.target.value))} className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded px-3 py-1.5 text-red-400 font-bold" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingTeamId(null)} className="px-4 py-2 text-xs font-mono text-[#888] hover:text-white">Cancel</button>
              <button onClick={handleSaveTeamEdit} className="px-5 py-2 text-xs font-mono font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Timer Modal */}
      {editingEventId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl max-w-md w-full p-6 space-y-4 font-mono">
            <h3 className="text-sm font-bold text-white uppercase">Configure Event: {editingEventId}</h3>
            <div>
              <label className="text-[10px] text-[#888] uppercase block mb-1">Start Time</label>
              <input type="datetime-local" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-white" />
            </div>
            <div>
              <label className="text-[10px] text-[#888] uppercase block mb-1">End Time</label>
              <input type="datetime-local" value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-white" />
            </div>
            <div>
              <label className="text-[10px] text-[#888] uppercase block mb-1">External Event Website URL (Future)</label>
              <input type="url" value={eventUrl} onChange={(e) => setEventUrlInput(e.target.value)} placeholder="https://quiz.zerone.ieee.org" className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-white" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingEventId(null)} className="px-4 py-2 text-xs text-[#888] hover:text-white">Cancel</button>
              <button onClick={handleSaveEventTimer} className="px-5 py-2 text-xs font-bold bg-[#7c3aed] text-white rounded-lg">Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
