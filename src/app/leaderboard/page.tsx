'use client';

import React from 'react';
import HeaderNavbar from '@/components/layout/HeaderNavbar';
import { useZerone } from '@/context/AppContext';
import { Crown, TrendingUp } from 'lucide-react';

export default function LeaderboardPage() {
  const { teams } = useZerone();

  // Convert context teams to array and sort by score descending
  const teamList = Object.values(teams || {}).map((t) => ({
    id: t.id,
    name: t.name || `Squad ${t.id}`,
    score: t.totalScore ?? 0,
    leadingArena: (t.currentEvent || 'PITCH').toUpperCase(),
    recentPoints: t.scores?.bonus || 120,
  }));

  // Fallback demo teams if context is empty
  const defaultTeams = [
    { id: '1', name: 'Nullpointer', score: 4820, leadingArena: 'PITCH', recentPoints: 120 },
    { id: '2', name: 'Terminal Velocity', score: 4655, leadingArena: 'SELL', recentPoints: 95 },
    { id: '3', name: 'Segfault Society', score: 4498, leadingArena: 'QUIZ', recentPoints: 60 },
    { id: '4', name: 'Binary Bandits', score: 4310, leadingArena: 'HUNT', recentPoints: 85 },
    { id: '5', name: 'Stack Overflow', score: 4180, leadingArena: 'PITCH', recentPoints: 70 },
    { id: '6', name: 'Cyber Titans', score: 3950, leadingArena: 'SELL', recentPoints: 50 },
    { id: '7', name: 'AlgoRhythms', score: 3820, leadingArena: 'QUIZ', recentPoints: 45 },
    { id: '8', name: 'DevOps Mavericks', score: 3690, leadingArena: 'HUNT', recentPoints: 40 },
  ];

  const sortedTeams = teamList.length > 0 ? teamList.sort((a, b) => b.score - a.score) : defaultTeams;

  return (
    <div className="relative min-h-screen bg-[#0E0F11] text-[#F4F4F0] selection:bg-[#F97316] selection:text-black pb-24">
      {/* Blueprint Grid Overlay */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0 opacity-30" />

      {/* Header Navigation */}
      <HeaderNavbar />

      <main className="relative z-10 pt-36 px-6 max-w-[1280px] mx-auto">
        {/* Badge Header */}
        <div className="badge-state-green mb-6">
          <span className="green-dot" />
          <span>CONTROL PLANE · SSE · 4 ARENAS → 1 SCREEN</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-section-heading text-4xl sm:text-5xl text-[#F4F4F0] mb-4">
          Live standings.
        </h1>
        <p className="text-body max-w-xl mb-12">
          Scores settle within four milliseconds of a scan. Nothing here is manual.
        </p>

        {/* Indicator Ribbon */}
        <div className="card-carbon-static !p-4 mb-8 flex items-center justify-between font-mono text-xs text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="green-dot" />
            <span className="text-[#3FBF74] font-bold">LIVE FEED ACTIVE</span>
          </div>
          <div className="flex items-center gap-6">
            <span>SYNC: SSE</span>
            <span className="text-[#F4F4F0]">LATENCY 4 MS</span>
          </div>
        </div>

        {/* Table List */}
        <div className="space-y-4">
          {sortedTeams.map((team, index) => {
            const rank = index + 1;
            const isFirst = rank === 1;
            const isSecond = rank === 2;
            const isThird = rank === 3;

            return (
              <div
                key={team.id}
                className={`card-carbon p-6 flex items-center justify-between gap-4 transition-all ${
                  isFirst ? 'border-[#3FBF74]/50 bg-[#1D2025]' : ''
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <div
                    className={`w-10 h-10 rounded-[12px] font-mono font-bold text-sm flex items-center justify-center shrink-0 border ${
                      isFirst
                        ? 'bg-[#3FBF74]/15 border-[#3FBF74] text-[#3FBF74]'
                        : isSecond
                        ? 'bg-[#1D2025] border-[#71717A] text-[#F4F4F0]'
                        : isThird
                        ? 'bg-[#1D2025] border-[#2A2D33] text-[#71717A]'
                        : 'bg-[#0E0F11] border-[#2A2D33] text-[#71717A]'
                    }`}
                  >
                    {isFirst ? <Crown className="w-5 h-5" /> : rank}
                  </div>

                  {/* Team Details */}
                  <div>
                    <div className="text-card-heading flex items-center gap-2">
                      {team.name}
                    </div>
                    <div className="text-sys-mono text-[#71717A] mt-1">
                      LEADING ARENA · <span className="text-[#F4F4F0]">{team.leadingArena}</span>
                    </div>
                  </div>
                </div>

                {/* Score & Gains */}
                <div className="flex items-center gap-6 sm:gap-10">
                  <div className="hidden sm:flex items-center gap-1.5 text-[#3FBF74] font-mono text-xs bg-[#3FBF74]/10 px-3 py-1 rounded-[8px] border border-[#3FBF74]/20">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{team.recentPoints}
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-[#F4F4F0]">
                    {team.score}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
