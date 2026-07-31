'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';
import { buildLeaderboard } from '@/lib/leaderboard';
import CollapsibleSidebar from '@/components/layout/CollapsibleSidebar';
import HorizontalRoadmap from '@/components/features/HorizontalRoadmap';
import QRScanner from '@/components/features/QRScanner';
import { motion } from 'framer-motion';
import {
  Workflow, QrCode, Users, Trophy, User,
  ShieldAlert, ArrowRight, X, Lock, BarChart3, Edit2, CheckCircle2
} from 'lucide-react';

function AnimatedStat({ value, color = 'text-white' }: { value: string | number; color?: string }) {
  return (
    <motion.div className={'text-3xl font-bold heading ' + color} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      {value}
    </motion.div>
  );
}

function ScoreBar({ label, value, color = '#00d992' }: { label: string; value: number; color?: string }) {
  const pct = Math.min(value, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px]">
        <span className="font-mono text-[#8b949e] uppercase tracking-wider">{label}</span>
        <span className="font-bold body-text" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }} />
      </div>
    </div>
  );
}

export default function VolunteerDashboard() {
  const router = useRouter();
  const { currentUser, isLoading, volunteers, teams, eventControls, registerTeam, updateTeamName, logout } = useZerone();
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [scannedMembers, setScannedMembers] = useState<any[]>([]);
  const [teamName, setTeamName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [creationError, setCreationError] = useState<string | null>(null);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [selectedEventModal, setSelectedEventModal] = useState<any>(null);
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameUpdateError, setNameUpdateError] = useState<string | null>(null);

  const handleSaveTeamName = async () => {
    if (!editNameValue.trim() || !assignedTeam) return;
    setIsUpdatingName(true);
    setNameUpdateError(null);
    try {
      await updateTeamName(assignedTeam.id, editNameValue.trim());
      setIsEditingTeamName(false);
    } catch (err: any) {
      setNameUpdateError(err.message || 'Failed to update team name.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'volunteer')) {
      router.push('/volunteer/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#101010] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-[#00d992] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8b949e] text-sm font-mono">Loading Volunteer Portal...</p>
        </div>
      </div>
    );
  }

  const volData = volunteers[currentUser.uid] || {
    name: currentUser.name, email: currentUser.email,
    phone: 'N/A', department: 'N/A', joinCode: 'VOL-7000',
    assignedTeamId: currentUser.assignedTeamId,
  };
  const assignedTeam = currentUser.assignedTeamId ? teams[currentUser.assignedTeamId] : null;
  const leaderboard = buildLeaderboard(teams);
  const myTeamRank = assignedTeam ? (leaderboard.find((l: any) => l.teamId === assignedTeam.id)?.rank || 'N/A') : 'N/A';

  const handleAddParticipant = (parsed: any) => {
    if (scannedMembers.some((m: any) => m.id === parsed.id)) return;
    const inExisting = Object.values(teams).find((t: any) => t.members.some((m: any) => m.id === parsed.id));
    if (inExisting) { alert(`${parsed.name} already in team: ${(inExisting as any).name}`); return; }
    setScannedMembers((prev: any[]) => [...prev, { id: parsed.id, name: parsed.name, department: parsed.department, teamId: null }]);
  };

  const handleRemoveScanned = (id: string) => setScannedMembers((prev: any[]) => prev.filter((m: any) => m.id !== id));

  const handleRegisterTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreationError(null);
    if (!teamName.trim()) { setCreationError('Enter a team name.'); return; }
    if (scannedMembers.length === 0) { setCreationError('Scan at least one participant.'); return; }
    setIsSubmittingTeam(true);
    try {
      await registerTeam(teamName.trim(), scannedMembers, groupName.trim() || undefined);
      setScannedMembers([]); setTeamName(''); setGroupName('');
      setActiveSection('team_details');
    } catch (err: any) { setCreationError(err.message || 'Failed.'); }
    finally { setIsSubmittingTeam(false); }
  };

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',    icon: Workflow },
    { id: 'qr_scanner',   label: 'QR Scanner',   icon: QrCode, badge: scannedMembers.length > 0 ? String(scannedMembers.length) : undefined, badgeColor: 'bg-[#00d992]/15 text-[#00d992] border-[#00d992]/40' },
    { id: 'team_details', label: 'Team Details', icon: Users },
    { id: 'leaderboard',  label: 'Leaderboard',  icon: Trophy },
    { id: 'profile',      label: 'Profile',      icon: User },
  ];

  return (
    <div className="relative min-h-screen bg-[#101010] text-[#f5f6f7] flex flex-row overflow-x-hidden">
      <div className="noise" />
      <div className="mesh-blob w-[550px] h-[550px] bg-[#00d992]/12 top-[-10%] left-[-5%]" />
      <div className="mesh-blob w-[600px] h-[600px] bg-[#3d3a39]/18 top-[40%] right-[-10%]" />
      <CollapsibleSidebar title="ZERONE 7.0" roleTag="VOLUNTEER" themeColor="cyan" menuItems={navItems} activeTab={activeSection} onSelectTab={(id) => setActiveSection(id)} userName={volData.name} userEmail={volData.email} onLogout={logout} />

      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">

        {/* ── DASHBOARD ─────────────────────────────────── */}
        {activeSection === 'dashboard' && (
          <motion.div className="space-y-7" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[10px] font-mono text-[#00d992] uppercase tracking-widest mb-1">Volunteer Portal</div>
                <h1 className="text-2xl text-white heading">{volData.name}</h1>
                <p className="text-[13px] text-[#8b949e] mt-1 body-text">IEEE Zerone 7.0 · Volunteer Coordinator</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono bg-[#1a1a1a] border border-[#3d3a39] rounded-xl px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#00d992] animate-pulse" />
                <span className="text-[#00d992] font-bold">APPROVED</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Assigned Team */}
              <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 space-y-3 premium-card">
                <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Assigned Team</div>
                {assignedTeam ? (
                  <>
                    <div>
                      <div className="text-lg font-bold text-white heading truncate">{assignedTeam.name}</div>
                      <div className="text-[11px] text-[#00d992] font-mono mt-0.5">{assignedTeam.id}</div>
                      <div className="text-[11px] text-[#8b949e] mt-1 body-text">{assignedTeam.members.length} Members</div>
                    </div>
                    <button onClick={() => setActiveSection('team_details')} className="w-full flex items-center justify-center gap-2 bg-[#00d992]/10 hover:bg-[#00d992]/18 border border-[#00d992]/35 text-[#00d992] font-semibold py-2.5 rounded-xl text-xs transition-all body-text">
                      View Team <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-sm font-semibold text-amber-400 body-text">No Team Formed</div>
                      <p className="text-[11px] text-[#8b949e] mt-1 body-text">Scan QR codes to register a squad.</p>
                    </div>
                    <button onClick={() => setActiveSection('qr_scanner')} className="w-full flex items-center justify-center gap-2 bg-[#00d992] hover:bg-[#00d992]/90 text-[#101010] font-bold py-2.5 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(56,214,245,0.3)] body-text">
                      Start Scanning QRs <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Scanned Queue */}
              <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 space-y-3 premium-card">
                <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Scanned Queue</div>
                <AnimatedStat value={scannedMembers.length} color={scannedMembers.length > 0 ? 'text-[#00d992]' : 'text-white'} />
                <div className="text-[11px] text-[#8b949e] body-text">Ready for registration</div>
                <button onClick={() => setActiveSection('qr_scanner')} className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#3d3a39] border border-[#3d3a39] text-white font-semibold py-2.5 rounded-xl text-xs transition-all body-text">
                  Open QR Scanner <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Rank */}
              <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 space-y-3 premium-card">
                <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Team Rank</div>
                <AnimatedStat value={myTeamRank !== 'N/A' ? `#${myTeamRank}` : '—'} color="text-[#00d992]" />
                <div className="text-[11px] text-[#8b949e] body-text">Score: {assignedTeam ? `${assignedTeam.totalScore} pts` : 'N/A'}</div>
                <button onClick={() => setActiveSection('leaderboard')} className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#3d3a39] border border-[#3d3a39] text-white font-semibold py-2.5 rounded-xl text-xs transition-all body-text">
                  View Leaderboard <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <HorizontalRoadmap events={eventControls} onSelectEvent={setSelectedEventModal} />
          </motion.div>
        )}

        {/* ── QR SCANNER & DIRECT REGISTRATION ───────────── */}
        {activeSection === 'qr_scanner' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div>
              <h2 className="text-xl font-bold text-white heading">QR Scanner</h2>
              <p className="text-[13px] text-[#8b949e] mt-1 body-text">Scan participant QR codes and register your team.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7"><QRScanner onScanSuccess={handleAddParticipant} /></div>
              <div className="lg:col-span-5 rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#3d3a39]/60 pb-3">
                  <h3 className="text-sm font-semibold text-white heading">Scanned Members ({scannedMembers.length})</h3>
                  {scannedMembers.length > 0 && <button onClick={() => setScannedMembers([])} className="text-[11px] text-red-400 hover:text-red-300 font-mono transition-colors">Clear All</button>}
                </div>
                <div className="space-y-2 max-h-[260px] overflow-y-auto">
                  {scannedMembers.map((m: any, idx: number) => (
                    <motion.div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a] border border-[#3d3a39]" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00d992]/15 border border-[#00d992]/30 text-[#00d992] font-bold text-xs font-mono">{m.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-[#00d992] font-bold">#{idx + 1}</span>
                          <span className="text-sm font-semibold text-white body-text truncate">{m.name}</span>
                        </div>
                        <span className="text-[10px] bg-[#3d3a39] text-[#8b949e] px-1.5 py-0.5 rounded font-mono">{m.department}</span>
                      </div>
                      <button onClick={() => handleRemoveScanned(m.id)} className="text-[#3d3a39] hover:text-red-400 p-1 transition-colors shrink-0"><X className="h-4 w-4" /></button>
                    </motion.div>
                  ))}
                  {scannedMembers.length === 0 && (
                    <div className="py-10 text-center space-y-2">
                      <QrCode className="h-8 w-8 text-[#3d3a39] mx-auto" />
                      <p className="text-[12px] text-[#8b949e] body-text">No participants scanned yet.</p>
                    </div>
                  )}
                </div>

                {/* Direct Team Registration Form */}
                {scannedMembers.length > 0 && (
                  <form onSubmit={handleRegisterTeamSubmit} className="space-y-3 pt-2 border-t border-[#3d3a39]/60">
                    {creationError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> {creationError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider mb-1 block">Team Name *</label>
                        <input
                          type="text"
                          value={teamName}
                          onChange={e => setTeamName(e.target.value)}
                          required
                          placeholder="e.g. Cyber Ninjas"
                          className="w-full bg-[#101010] border border-[#3d3a39] focus:border-[#00d992] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5c5855] outline-none body-text"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider mb-1 block">Group Name <span className="text-[#5c5855] normal-case">(optional)</span></label>
                        <input
                          type="text"
                          value={groupName}
                          onChange={e => setGroupName(e.target.value)}
                          placeholder="e.g. Alpha Squad / Group A"
                          className="w-full bg-[#101010] border border-[#3d3a39] focus:border-[#00d992]/70 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5c5855] outline-none body-text"
                        />
                      </div>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={isSubmittingTeam}
                      className="w-full flex items-center justify-center gap-2 bg-[#00d992] hover:bg-[#00d992]/90 disabled:opacity-40 text-[#101010] font-bold py-3 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(56,214,245,0.3)] body-text"
                      whileHover={{ scale: isSubmittingTeam ? 1 : 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {isSubmittingTeam ? (
                        <><div className="h-3.5 w-3.5 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" /> Registering...</>
                      ) : (
                        <>Register Team &amp; View Details <ArrowRight className="h-3.5 w-3.5" /></>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TEAM DETAILS ───────────────────────────────── */}
        {activeSection === 'team_details' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div>
              <h2 className="text-xl font-bold text-white heading">Team Details</h2>
              <p className="text-[13px] text-[#8b949e] mt-1 body-text">Your squad profile and current standings.</p>
            </div>
            {assignedTeam ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-[#00d992]/35 bg-[#1a1a1a] p-6 relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#00d992]/6 to-transparent" />
                  <div className="absolute top-5 right-5 text-right">
                    <div className="text-[9px] font-mono text-[#8b949e] uppercase mb-0.5">Rank</div>
                    <div className="text-3xl font-black text-[#00d992] heading">#{myTeamRank}</div>
                  </div>
                  <div className="relative">
                    <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider mb-1.5">Official Team Name</div>
                    {isEditingTeamName ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={e => setEditNameValue(e.target.value)}
                            autoFocus
                            className="flex-1 bg-[#1a1a1a] border border-[#00d992] focus:border-[#00d992] rounded-xl px-4 py-2.5 text-lg font-bold text-white outline-none heading uppercase tracking-wide"
                            placeholder="Enter team name..."
                          />
                          <button
                            onClick={handleSaveTeamName}
                            disabled={isUpdatingName || !editNameValue.trim()}
                            className="flex items-center gap-1.5 bg-[#00d992] hover:bg-[#00d992]/90 disabled:opacity-40 text-[#101010] font-bold px-4 py-2.5 rounded-xl text-sm transition-all body-text shrink-0"
                          >
                            {isUpdatingName ? <div className="h-4 w-4 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            {isUpdatingName ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => { setIsEditingTeamName(false); setNameUpdateError(null); }}
                            className="px-3 py-2.5 text-sm text-[#8b949e] hover:text-white border border-[#3d3a39] hover:border-[#00d992] rounded-xl transition-all body-text shrink-0"
                          >
                            Cancel
                          </button>
                        </div>
                        {nameUpdateError && (
                          <div className="text-[11px] text-red-400 font-mono">{nameUpdateError}</div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 group">
                        <h2 className="text-2xl font-bold text-white heading uppercase">{assignedTeam.name}</h2>
                        <button
                          onClick={() => { setEditNameValue(assignedTeam.name); setIsEditingTeamName(true); setNameUpdateError(null); }}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-mono text-[#00d992] hover:text-white bg-[#1a1a1a] hover:bg-[#3d3a39] border border-[#3d3a39] hover:border-[#00d992] px-2.5 py-1.5 rounded-lg transition-all shrink-0"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                      </div>
                    )}
                    <div className="text-[11px] font-mono text-[#00d992] font-bold mt-1">Team ID: {assignedTeam.id}</div>
                    {assignedTeam.groupName && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Group:</span>
                        <span className="text-[11px] font-semibold text-white bg-[#00d992]/10 border border-[#00d992]/30 px-2.5 py-0.5 rounded-full font-mono">{assignedTeam.groupName}</span>
                      </div>
                    )}
                    <p className="text-[12px] text-[#8b949e] mt-1 body-text">Volunteer: <span className="text-white">{assignedTeam.volunteerName}</span></p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                    {[
                      { label: 'Total Score', value: `${assignedTeam.totalScore} pts`, color: 'text-[#00d992]' },
                      { label: 'Current Event', value: assignedTeam.currentEvent, color: 'text-white' },
                      { label: 'Status', value: assignedTeam.eventStatus, color: 'text-amber-400' },
                      { label: 'Members', value: `${assignedTeam.members.length} Registered`, color: 'text-white' },
                    ].map((item: any) => (
                      <div key={item.label} className="rounded-xl bg-[#1a1a1a] border border-[#3d3a39] p-3">
                        <div className="text-[10px] font-mono text-[#8b949e] mb-1">{item.label}</div>
                        <div className={`text-sm font-semibold body-text ${item.color}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-white heading">Team Members</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignedTeam.members.map((m: any, i: number) => (
                      <div key={m.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1a1a1a] border border-[#3d3a39]">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00d992]/12 border border-[#00d992]/25 text-[#00d992] font-bold text-sm font-mono">{m.name.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white body-text truncate">{m.name}</div>
                          <div className="text-[10px] text-[#8b949e] mt-0.5 body-text">{m.department}</div>
                        </div>
                        <span className="text-[10px] text-[#3d3a39] font-mono shrink-0">{m.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white heading flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#00d992]" /> Score Breakdown</h3>
                  <div className="space-y-3">
                    <ScoreBar label="Quiz" value={assignedTeam.scores.quiz || 0} color="#a78bfa" />
                    <ScoreBar label="Pitch" value={assignedTeam.scores.pitch || 0} color="#fbbf24" />
                    <ScoreBar label="Sell" value={assignedTeam.scores.sell || 0} color="#00d992" />
                    <ScoreBar label="Treasure Hunt" value={assignedTeam.scores.treasureHunt || 0} color="#34d399" />
                    <ScoreBar label="Bonus" value={assignedTeam.scores.bonus || 0} color="#00d992" />
                    <ScoreBar label="Penalty" value={assignedTeam.scores.penalty || 0} color="#ef4444" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-16 text-center space-y-4">
                <Users className="h-10 w-10 text-[#3d3a39] mx-auto" />
                <div className="text-base font-semibold text-white heading">No Team Yet</div>
                <button onClick={() => setActiveSection('qr_scanner')} className="inline-flex items-center gap-2 bg-[#00d992] text-[#101010] font-bold px-6 py-2.5 rounded-xl text-sm body-text">Start Scanning QRs <ArrowRight className="h-4 w-4" /></button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── LEADERBOARD ───────────────────────────────── */}
        {activeSection === 'leaderboard' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-white heading">Central Leaderboard</h2>
                <p className="text-[13px] text-[#8b949e] mt-1 body-text">Live rankings from all registered teams.</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#00d992]"><span className="h-2 w-2 rounded-full bg-[#00d992] animate-pulse" /> Live Sync</div>
            </div>
            <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] overflow-hidden">
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
                      <th className="px-4 py-3 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3d3a39]/60">
                    {leaderboard.map((entry: any, i: number) => {
                      const isMyTeam = entry.teamId === currentUser.assignedTeamId;
                      return (
                        <motion.tr key={entry.teamId} className={`transition-colors ${isMyTeam ? 'bg-[#00d992]/6 border-l-2 border-l-[#00d992]' : 'hover:bg-[#1a1a1a]'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
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
                          <td className="px-4 py-3 text-right"><span className="text-base font-black text-[#00d992] heading">{entry.totalScore}</span><span className="text-[10px] text-[#8b949e] font-mono ml-0.5">pts</span></td>
                        </motion.tr>
                      );
                    })}
                    {leaderboard.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-[#8b949e] text-sm body-text">No teams on leaderboard yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PROFILE ───────────────────────────────────── */}
        {activeSection === 'profile' && (
          <motion.div className="space-y-6 max-w-lg mx-auto" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div>
              <h2 className="text-xl font-bold text-white heading">Volunteer Profile</h2>
              <p className="text-[13px] text-[#8b949e] mt-1 body-text">Your registered credentials and join code.</p>
            </div>
            <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] overflow-hidden">
              <div className="p-6 flex items-center gap-4 border-b border-[#3d3a39] bg-gradient-to-r from-[#00d992]/8 to-transparent">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00d992]/15 border-2 border-[#00d992]/35 text-[#00d992] font-black text-xl heading">{volData.name.charAt(0)}</div>
                <div>
                  <div className="text-lg font-bold text-white heading">{volData.name}</div>
                  <div className="text-[12px] text-[#00d992] font-mono mt-0.5">{volData.email}</div>
                </div>
              </div>
              <div className="divide-y divide-[#3d3a39]/60">
                {[
                  { label: 'Phone',         value: volData.phone,                    color: 'text-white' },
                  { label: 'Department',    value: volData.department,               color: 'text-white' },
                  { label: 'Join Code',     value: volData.joinCode,                 color: 'text-[#00d992]' },
                  { label: 'Status',        value: 'Approved',                       color: 'text-[#00d992]' },
                  { label: 'Assigned Team', value: volData.assignedTeamId || 'None', color: 'text-[#8b949e]' },
                ].map((row: any) => (
                  <div key={row.label} className="flex items-center justify-between px-6 py-3.5">
                    <span className="text-[12px] font-mono text-[#8b949e] uppercase tracking-wider">{row.label}</span>
                    <span className={`text-sm font-semibold body-text ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div className="bg-[#1a1a1a] border border-[#3d3a39] rounded-2xl max-w-sm w-full p-6 space-y-4 text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00d992]/12 border border-[#00d992]/30 text-[#00d992] mx-auto"><Lock className="h-6 w-6" /></div>
            <div>
              <div className="text-[10px] font-mono text-[#00d992] font-bold uppercase mb-1">Independent Event</div>
              <h3 className="text-lg font-bold text-white heading">{selectedEventModal.name}</h3>
              <p className="text-[12px] text-[#8b949e] mt-2 leading-relaxed body-text">{selectedEventModal.description}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/25 text-amber-400 text-[12px] body-text">Runs on an independent website. Scores via API.</div>
            <button onClick={() => setSelectedEventModal(null)} className="w-full bg-[#1a1a1a] hover:bg-[#3d3a39] border border-[#3d3a39] text-white font-semibold py-2.5 rounded-xl text-sm transition-all body-text">Close</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
