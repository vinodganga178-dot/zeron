'use client';

import React from 'react';
import HeaderNavbar from '@/components/layout/HeaderNavbar';
import { useZerone } from '@/context/AppContext';
import { Crown, TrendingUp, Trophy, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="relative min-h-screen bg-[#101010] text-[#f5f6f7] font-mono selection:bg-[#00d992] selection:text-black pb-28">
      {/* Noise Overlay */}
      <div className="noise" />

      {/* Header Navigation */}
      <HeaderNavbar />

      <main className="relative z-10 pt-28 sm:pt-36 px-4 sm:px-6 max-w-[1280px] mx-auto space-y-6">
        {/* Header Title Section */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d992]/10 border border-[#00d992]/30 text-[#00d992] text-[10px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#00d992] animate-pulse" />
            <span>CONTROL PLANE · LIVE SYNC (LATENCY 4MS)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight heading">
            Live Standings.
          </h1>
          <p className="text-xs sm:text-sm text-[#8b949e] max-w-xl body-text">
            Scores update automatically within milliseconds of volunteer scan verification.
          </p>
        </div>

        {/* Sync Status Banner */}
        <div className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#00d992] animate-spin" />
            <span className="text-[#00d992] font-bold">AUTOMATED SCORE ENGINE ACTIVE</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 text-[#8b949e] text-[11px]">
            <span>SYNC: SSE PIPELINE</span>
            <span className="text-white font-bold">LATENCY &lt; 4MS</span>
          </div>
        </div>

        {/* Responsive Team Ranks (Single column on mobile, cards with rank highlights) */}
        <div className="space-y-3">
          {sortedTeams.map((team, index) => {
            const rank = index + 1;
            const isFirst = rank === 1;
            const isSecond = rank === 2;
            const isThird = rank === 3;

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isFirst
                    ? 'border-[#00d992]/60 bg-[#00d992]/10 shadow-[0_0_30px_rgba(0,217,146,0.15)]'
                    : isSecond
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : isThird
                    ? 'border-[#7c3aed]/40 bg-[#7c3aed]/5'
                    : 'border-[#3d3a39] bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-3.5 sm:gap-5">
                  {/* Rank Badge */}
                  <div
                    className={`w-11 h-11 rounded-xl font-mono font-black text-sm flex items-center justify-center shrink-0 border ${
                      isFirst
                        ? 'bg-[#00d992] text-black border-[#00d992]'
                        : isSecond
                        ? 'bg-amber-400 text-black border-amber-400'
                        : isThird
                        ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                        : 'bg-[#101010] text-[#8b949e] border-[#3d3a39]'
                    }`}
                  >
                    {isFirst ? <Crown className="w-5 h-5" /> : `#${rank}`}
                  </div>

                  {/* Team Details */}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-bold text-white truncate flex items-center gap-2">
                      <span>{team.name}</span>
                      {isFirst && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00d992]/20 text-[#00d992] border border-[#00d992]/40">
                          LEADER
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#8b949e] font-mono mt-0.5 flex items-center gap-2">
                      <span>ARENA: <strong className="text-white">{team.leadingArena}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Score & Gain Indicator */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-[#3d3a39] pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-[#00d992] font-mono text-xs bg-[#00d992]/10 px-3 py-1 rounded-lg border border-[#00d992]/30">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{team.recentPoints} pts</span>
                  </div>

                  <div className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {team.score}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
