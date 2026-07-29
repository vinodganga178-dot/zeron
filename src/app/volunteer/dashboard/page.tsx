'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';
import { Participant, QRScanResult, EventControl } from '@/types';
import { parseQRCode, generateParticipantId } from '@/lib/qr';
import { buildLeaderboard } from '@/lib/leaderboard';
import CollapsibleSidebar from '@/components/layout/CollapsibleSidebar';
import { NavMenuItem } from '@/components/layout/CollapsibleSidebar';
import CandyRoadmap from '@/components/features/CandyRoadmap';
import QRScanner from '@/components/features/QRScanner';
import {
  Workflow, QrCode, Users, Plus, CheckCircle2, Trophy, Map, User, LogOut,
  Sparkles, ShieldAlert, ArrowRight, Camera, X, Play, Lock, AlertTriangle, ChevronRight
} from 'lucide-react';

export default function VolunteerDashboard() {
  const router = useRouter();
  const { currentUser, isLoading, volunteers, teams, eventControls, registerTeam, logout } = useZerone();

  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'qr_scanner' | 'team_formation' | 'team_details' | 'roadmap' | 'leaderboard' | 'profile'
  >('dashboard');

  // QR Scanning & Team Formation state
  const [scannedMembers, setScannedMembers] = useState<Participant[]>([]);
  const [teamName, setTeamName] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualDept, setManualDept] = useState('');
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string | null>(null);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [registeredTeamId, setRegisteredTeamId] = useState<string | null>(null);

  // Roadmap "Coming Soon" Modal state
  const [selectedEventModal, setSelectedEventModal] = useState<EventControl | null>(null);

  // Route guard
  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'volunteer')) {
      router.push('/volunteer/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#888] font-mono text-xs">
        Loading Volunteer Portal...
      </div>
    );
  }

  const volData = volunteers[currentUser.uid] || {
    name: currentUser.name,
    email: currentUser.email,
    phone: 'N/A',
    department: 'N/A',
    joinCode: 'VOL-7000',
    assignedTeamId: currentUser.assignedTeamId,
  };

  const assignedTeam = currentUser.assignedTeamId ? teams[currentUser.assignedTeamId] : null;
  const leaderboard = buildLeaderboard(teams);
  const myTeamRank = assignedTeam ? leaderboard.find(l => l.teamId === assignedTeam.id)?.rank || 'N/A' : 'N/A';

  // Add scanned or simulated participant
  const handleAddParticipant = (parsed: QRScanResult) => {
    if (scannedMembers.some(m => m.id === parsed.id)) {
      setScanSuccessMsg(`Participant ${parsed.name} (${parsed.id}) is already scanned.`);
      setTimeout(() => setScanSuccessMsg(null), 2500);
      return;
    }

    // Check if participant is already in any existing team
    const inExisting = Object.values(teams).find(t => t.members.some(m => m.id === parsed.id));
    if (inExisting) {
      alert(`Participant ${parsed.name} already belongs to team "${inExisting.name}" (${inExisting.id}). Each participant can belong to only one team.`);
      return;
    }

    const newMember: Participant = {
      id: parsed.id,
      name: parsed.name,
      department: parsed.department,
      teamId: null,
    };

    setScannedMembers(prev => [...prev, newMember]);
    setScanSuccessMsg(`Scanned: ${parsed.name} (${parsed.id})`);
    setTimeout(() => setScanSuccessMsg(null), 2500);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    const id = manualCode.trim() || generateParticipantId();
    handleAddParticipant({
      id,
      name: manualName.trim(),
      department: manualDept.trim() || 'General',
    });
    setManualCode('');
    setManualName('');
    setManualDept('');
  };

  const handleRemoveScanned = (id: string) => {
    setScannedMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleRegisterTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreationError(null);

    if (!teamName.trim()) {
      setCreationError('Please enter a Team Name.');
      return;
    }

    if (scannedMembers.length === 0) {
      setCreationError('Please scan at least one participant using the QR scanner first.');
      return;
    }

    setIsSubmittingTeam(true);

    try {
      const created = await registerTeam(teamName.trim(), scannedMembers);
      setRegisteredTeamId(created.id);
      setScannedMembers([]);
      setTeamName('');
      setActiveSection('team_details');
    } catch (e: any) {
      setCreationError(e.message || 'Failed to create team.');
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const volunteerNavItems: NavMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Workflow },
    {
      id: 'qr_scanner',
      label: 'QR Scanner',
      icon: QrCode,
      badge: scannedMembers.length > 0 ? `${scannedMembers.length}` : undefined,
      badgeColor: 'bg-green-500/20 text-green-400 border-green-500/40'
    },
    { id: 'team_formation', label: 'Team Formation', icon: Plus },
    { id: 'team_details', label: 'Team Details', icon: Users },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f2f2f2] font-sans flex flex-row">
      {/* Collapsible Minimizable Left Sidebar */}
      <CollapsibleSidebar
        title="IEEE ZERONE"
        roleTag="VOLUNTEER"
        themeColor="cyan"
        menuItems={volunteerNavItems}
        activeTab={activeSection}
        onSelectTab={(id) => setActiveSection(id as any)}
        userName={volData.name}
        userEmail={volData.email}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* =========================================================
            SECTION 1: DASHBOARD OVERVIEW
            ========================================================= */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <div className="text-xs font-mono text-[#00e5ff] uppercase tracking-wider">Welcome back</div>
              <h1 className="text-2xl font-black text-white uppercase font-mono mt-1">{volData.name}</h1>
              <p className="text-xs text-[#666] mt-1">Volunteer Coordinator · IEEE Zerone 7.0 Operations Command</p>
            </div>

            {/* Quick Actions & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#262626] bg-[#111] p-5 space-y-3">
                <div className="text-[10px] font-mono text-[#666] uppercase tracking-wider">Assigned Team</div>
                {assignedTeam ? (
                  <div>
                    <div className="text-lg font-black text-white">{assignedTeam.name}</div>
                    <div className="text-xs text-[#00e5ff] font-mono mt-0.5">{assignedTeam.id}</div>
                    <div className="text-[11px] text-[#555] mt-2">{assignedTeam.members.length} Members registered</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-bold text-amber-400">No Team Formed Yet</div>
                    <p className="text-xs text-[#555] mt-1">Scan member QR codes to form your squad.</p>
                  </div>
                )}
                <button
                  onClick={() => setActiveSection(assignedTeam ? 'team_details' : 'team_formation')}
                  className="w-full mt-2 bg-[#00e5ff]/10 border border-[#00e5ff]/30 hover:bg-[#00e5ff]/20 text-[#00e5ff] font-bold py-2 rounded-xl text-xs font-mono transition-all"
                >
                  {assignedTeam ? 'View Team Details →' : 'Form New Team →'}
                </button>
              </div>

              <div className="rounded-2xl border border-[#262626] bg-[#111] p-5 space-y-3">
                <div className="text-[10px] font-mono text-[#666] uppercase tracking-wider">Scanned Queue</div>
                <div className="text-3xl font-black text-white font-mono">{scannedMembers.length}</div>
                <div className="text-[11px] text-[#555]">Participants ready for team formation</div>
                <button
                  onClick={() => setActiveSection('qr_scanner')}
                  className="w-full mt-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white font-bold py-2 rounded-xl text-xs font-mono transition-all"
                >
                  Open QR Scanner →
                </button>
              </div>

              <div className="rounded-2xl border border-[#262626] bg-[#111] p-5 space-y-3">
                <div className="text-[10px] font-mono text-[#666] uppercase tracking-wider">Team Leaderboard Rank</div>
                <div className="text-3xl font-black text-[#00d992] font-mono">
                  {myTeamRank !== 'N/A' ? `#${myTeamRank}` : '—'}
                </div>
                <div className="text-[11px] text-[#555]">Total Score: {assignedTeam ? `${assignedTeam.totalScore} pts` : 'N/A'}</div>
                <button
                  onClick={() => setActiveSection('leaderboard')}
                  className="w-full mt-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white font-bold py-2 rounded-xl text-xs font-mono transition-all"
                >
                  View Leaderboard →
                </button>
              </div>
            </div>

            {/* Workflow Step Guide */}
            <div className="rounded-2xl border border-[#262626] bg-[#111] p-6 space-y-4">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Workflow className="h-4 w-4 text-[#00e5ff]" /> Team Formation Workflow
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                {[
                  { step: '01', title: 'Scan Member QRs', desc: 'Scan every squad participant\'s QR ID code.' },
                  { step: '02', title: 'Link Into Team', desc: 'All scanned members form a single squad queue.' },
                  { step: '03', title: 'Enter Team Name', desc: 'Give your squad an official competition name.' },
                  { step: '04', title: 'Submit & Live', desc: 'System generates Team ID & pushes to Leaderboard.' },
                ].map((s) => (
                  <div key={s.step} className="rounded-xl border border-[#222] bg-[#0a0a0b] p-4 space-y-1.5">
                    <span className="text-[10px] font-black text-[#00e5ff]">{s.step}</span>
                    <div className="font-bold text-white">{s.title}</div>
                    <div className="text-[11px] text-[#555] leading-relaxed">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 2: QR SCANNER
            ========================================================= */}
        {activeSection === 'qr_scanner' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Camera Scanner & Manual Entry */}
              <div className="lg:col-span-7">
                <QRScanner onScanSuccess={handleAddParticipant} />
              </div>

              {/* Scanned Queue List */}
              <div className="lg:col-span-5 rounded-2xl border border-[#262626] bg-[#111] p-6 space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-[#222] pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Scanned Queue ({scannedMembers.length})
                  </h3>
                  {scannedMembers.length > 0 && (
                    <button
                      onClick={() => setScannedMembers([])}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {scannedMembers.map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0b] border border-[#222] text-xs">
                      <div>
                        <span className="text-[10px] text-[#00e5ff] font-bold mr-2">#{idx + 1}</span>
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="text-[10px] text-[#666] ml-2">({m.department})</span>
                        <div className="text-[10px] text-[#555] mt-0.5">ID: {m.id}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveScanned(m.id)}
                        className="text-[#666] hover:text-red-400 p-1"
                        title="Remove member"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {scannedMembers.length === 0 && (
                    <div className="p-8 text-center text-[#555] text-xs italic">
                      No participants in team queue. Scan QR codes using the camera or preset buttons.
                    </div>
                  )}
                </div>

                {scannedMembers.length > 0 && (
                  <button
                    onClick={() => setActiveSection('team_formation')}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  >
                    Proceed to Team Formation ({scannedMembers.length} members) <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 3: TEAM FORMATION & REGISTRATION
            ========================================================= */}
        {(activeSection === 'team_formation') && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-lg font-black text-white uppercase font-mono">Team Formation & Registration</h2>
              <p className="text-xs text-[#666]">Review scanned members, assign Team Name, and generate unique Team ID.</p>
            </div>

            {creationError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" /> {creationError}
              </div>
            )}

            <form onSubmit={handleRegisterTeamSubmit} className="rounded-2xl border border-[#262626] bg-[#111] p-6 space-y-6 font-mono text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">
                  1. Official Team Name *
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  placeholder="e.g. Cyber Ninjas"
                  className="w-full bg-[#0a0a0b] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#00e5ff] outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                    2. Linked Team Members ({scannedMembers.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveSection('qr_scanner')}
                    className="text-[10px] text-[#00e5ff] hover:underline"
                  >
                    + Scan More Members
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {scannedMembers.map((m, i) => (
                    <div key={m.id} className="p-3 rounded-xl bg-[#0a0a0b] border border-[#222] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[#00e5ff] font-bold mr-2">#{i + 1}</span>
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="text-[10px] text-[#666] ml-2">({m.department})</span>
                      </div>
                      <span className="text-[10px] text-[#555]">{m.id}</span>
                    </div>
                  ))}
                  {scannedMembers.length === 0 && (
                    <div className="p-6 text-center text-amber-400 border border-dashed border-amber-500/30 rounded-xl bg-amber-500/5">
                      No members scanned yet. Please click &quot;+ Scan More Members&quot; to add team members first.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingTeam || scannedMembers.length === 0}
                className="w-full bg-[#00e5ff] hover:bg-[#00c8e0] text-black disabled:opacity-40 font-bold py-3.5 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(0,229,255,0.25)] flex items-center justify-center gap-2"
              >
                {isSubmittingTeam ? 'Generating Team ID & Registering...' : 'Register Team & Push to Leaderboard →'}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            SECTION 4: TEAM DETAILS
            ========================================================= */}
        {activeSection === 'team_details' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-white uppercase font-mono">Team Details</h2>
              <p className="text-xs text-[#666]">Comprehensive view of your assigned squad and current event status.</p>
            </div>

            {assignedTeam ? (
              <div className="space-y-6">
                {/* Team Card Header */}
                <div className="rounded-2xl border border-[#00e5ff]/40 bg-[#111] p-6 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 text-right font-mono">
                    <span className="text-[10px] text-[#666] uppercase block">Current Rank</span>
                    <span className="text-3xl font-black text-[#00d992]">#{myTeamRank}</span>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-[#00e5ff] font-bold">{assignedTeam.id}</span>
                    <h1 className="text-2xl font-black text-white uppercase font-mono mt-1">{assignedTeam.name}</h1>
                    <div className="text-xs text-[#666] font-mono mt-1">
                      Assigned Volunteer: <span className="text-white">{assignedTeam.volunteerName}</span> · Registered: {new Date(assignedTeam.registrationTime).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                    <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#222]">
                      <div className="text-[10px] text-[#555]">Total Score</div>
                      <div className="text-xl font-bold text-[#00d992]">{assignedTeam.totalScore} pts</div>
                    </div>
                    <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#222]">
                      <div className="text-[10px] text-[#555]">Current Event</div>
                      <div className="text-sm font-bold text-white">{assignedTeam.currentEvent}</div>
                    </div>
                    <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#222]">
                      <div className="text-[10px] text-[#555]">Event Status</div>
                      <div className="text-sm font-bold text-amber-400">{assignedTeam.eventStatus}</div>
                    </div>
                    <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#222]">
                      <div className="text-[10px] text-[#555]">Team Members</div>
                      <div className="text-sm font-bold text-white">{assignedTeam.members.length} Registered</div>
                    </div>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="rounded-2xl border border-[#262626] bg-[#111] p-6 space-y-4 font-mono">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Team Members</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {assignedTeam.members.map((m, i) => (
                      <div key={m.id} className="p-3.5 rounded-xl bg-[#0a0a0b] border border-[#222] flex items-center justify-between">
                        <div>
                          <span className="text-[#00e5ff] font-bold mr-2">#{i + 1}</span>
                          <span className="font-bold text-white">{m.name}</span>
                          <div className="text-[10px] text-[#666] mt-0.5">Dept: {m.department}</div>
                        </div>
                        <span className="text-[10px] text-[#555] font-mono">{m.id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marks Breakdown */}
                <div className="rounded-2xl border border-[#262626] bg-[#111] p-6 space-y-4 font-mono">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Event Marks Breakdown</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
                    <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#222]">
                      <div className="text-[10px] text-[#666]">Quiz</div>
                      <div className="text-lg font-bold text-white mt-1">{assignedTeam.scores.quiz || 0}</div>
                    </div>
                    <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#222]">
                      <div className="text-[10px] text-[#666]">Pitch</div>
                      <div className="text-lg font-bold text-white mt-1">{assignedTeam.scores.pitch || 0}</div>
                    </div>
                    <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#222]">
                      <div className="text-[10px] text-[#666]">Sell</div>
                      <div className="text-lg font-bold text-white mt-1">{assignedTeam.scores.sell || 0}</div>
                    </div>
                    <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#222]">
                      <div className="text-[10px] text-[#666]">Treasure</div>
                      <div className="text-lg font-bold text-white mt-1">{assignedTeam.scores.treasureHunt || 0}</div>
                    </div>
                    <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#222]">
                      <div className="text-[10px] text-green-400">Bonus</div>
                      <div className="text-lg font-bold text-green-400 mt-1">+{assignedTeam.scores.bonus || 0}</div>
                    </div>
                    <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#222]">
                      <div className="text-[10px] text-red-400">Penalty</div>
                      <div className="text-lg font-bold text-red-400 mt-1">-{assignedTeam.scores.penalty || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#262626] bg-[#111] p-12 text-center space-y-4 font-mono">
                <Users className="h-10 w-10 text-[#555] mx-auto" />
                <div className="text-sm font-bold text-white">No Team Registered Yet</div>
                <p className="text-xs text-[#666] max-w-md mx-auto">
                  You haven&apos;t formed a team yet. Go to QR Scanner to scan participant codes and form a squad.
                </p>
                <button
                  onClick={() => setActiveSection('qr_scanner')}
                  className="bg-[#00e5ff] text-black font-bold px-6 py-2.5 rounded-xl text-xs transition-all"
                >
                  Start Scanning QRs →
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            SECTION 5: ROADMAP
            ========================================================= */}
        {activeSection === 'roadmap' && (
          <div>
            <CandyRoadmap events={eventControls} />
          </div>
        )}

        {/* =========================================================
            SECTION 6: LEADERBOARD
            ========================================================= */}
        {activeSection === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white uppercase font-mono">Central Leaderboard</h2>
                <p className="text-xs text-[#666]">Live rankings automatically updated from event website submissions.</p>
              </div>
              <div className="text-xs font-mono text-[#00d992] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Live Sync
              </div>
            </div>

            <div className="rounded-2xl border border-[#262626] bg-[#111] overflow-hidden">
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
                      <th className="p-3.5 text-right">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222] text-[#ccc]">
                    {leaderboard.map((entry) => (
                      <tr key={entry.teamId} className={`hover:bg-[#161618] transition-colors ${entry.teamId === currentUser.assignedTeamId ? 'bg-[#00e5ff]/5 border-l-2 border-l-[#00e5ff]' : ''}`}>
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
                        <td className="p-3.5 text-right font-black text-base text-[#00d992]">{entry.totalScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 7: PROFILE
            ========================================================= */}
        {activeSection === 'profile' && (
          <div className="space-y-6 max-w-xl mx-auto font-mono text-xs">
            <div>
              <h2 className="text-lg font-black text-white uppercase font-mono">Volunteer Profile</h2>
              <p className="text-xs text-[#666]">Your registered volunteer credentials and assigned join code.</p>
            </div>

            <div className="rounded-2xl border border-[#262626] bg-[#111] p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-[#222] pb-4">
                <div className="h-12 w-12 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] font-black flex items-center justify-center text-lg">
                  {volData.name.charAt(0)}
                </div>
                <div>
                  <div className="text-base font-bold text-white">{volData.name}</div>
                  <div className="text-xs text-[#00e5ff]">{volData.email}</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between border-b border-[#222] pb-2">
                  <span className="text-[#666]">Phone</span>
                  <span className="text-white font-bold">{volData.phone}</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-2">
                  <span className="text-[#666]">Department</span>
                  <span className="text-white font-bold">{volData.department}</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-2">
                  <span className="text-[#666]">Join Code</span>
                  <span className="text-[#00e5ff] font-bold">{volData.joinCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Status</span>
                  <span className="text-green-400 font-bold uppercase">Approved</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* "Coming Soon" Event Roadmap Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl max-w-sm w-full p-6 space-y-4 font-mono text-center">
            <div className="h-12 w-12 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] text-[#00e5ff] font-bold uppercase">INDEPENDENT EVENT WEBSITE</div>
              <h3 className="text-lg font-black text-white mt-1">{selectedEventModal.name}</h3>
              <p className="text-xs text-[#777] mt-2 leading-relaxed">
                {selectedEventModal.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
              <span className="font-bold block">Coming Soon</span>
              This event will run on an independent website and send scores via API to the Main Website.
            </div>

            <button
              onClick={() => setSelectedEventModal(null)}
              className="w-full bg-[#1a1a1a] hover:bg-[#222] text-white font-bold py-2.5 rounded-xl text-xs border border-[#333] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
