'use client';

import React, { useRef, useState, useEffect } from 'react';
import { EventControl } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Lightbulb, TrendingUp, Compass,
  ChevronLeft, ChevronRight, CheckCircle2, Lock, Zap, Clock,
  X, ExternalLink, RefreshCw, ShieldCheck, Layers, Sparkles
} from 'lucide-react';

interface HorizontalRoadmapProps {
  events: EventControl[];
  onSelectEvent?: (event: EventControl) => void;
}

const STAGE_CFG = [
  { icon: HelpCircle,  color: '#a78bfa', glow: 'rgba(168,85,247,0.4)' },
  { icon: Lightbulb,   color: '#fbbf24', glow: 'rgba(251,191,36,0.4)' },
  { icon: TrendingUp,  color: '#00d992', glow: 'rgba(0,217,146,0.4)' },
  { icon: Compass,     color: '#34d399', glow: 'rgba(52,211,153,0.4)' },
];

function getStatusMeta(status: EventControl['status']) {
  switch (status) {
    case 'Active':     return { label: 'LIVE NOW',    color: '#00d992', bg: 'rgba(0,217,146,0.15)',  border: 'rgba(0,217,146,0.5)',  pulse: true  };
    case 'Completed':  return { label: 'COMPLETED',   color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.5)',  pulse: false };
    case 'Locked':     return { label: 'LOCKED',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.5)',   pulse: false };
    default:           return { label: 'COMING SOON', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.5)',  pulse: false };
  }
}

export default function HorizontalRoadmap({ events, onSelectEvent }: HorizontalRoadmapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [selectedModalEvent, setSelectedModalEvent] = useState<EventControl | null>(null);

  const sorted = [...events].sort((a, b) => a.order - b.order);
  const completedCount = sorted.filter(e => e.status === 'Completed').length;
  const progressPct    = sorted.length > 0 ? (completedCount / sorted.length) * 100 : 0;

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 260 : -260, behavior: 'smooth' });
  };

  const handleCardClick = (ev: EventControl) => {
    setSelectedModalEvent(ev);
    if (onSelectEvent) {
      onSelectEvent(ev);
    }
  };

  return (
    <div className="relative w-full rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 sm:p-6 overflow-hidden font-mono">
      <div className="pointer-events-none absolute top-0 right-0 h-56 w-56 rounded-full bg-[#7c3aed]/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#00d992]/5 blur-3xl" />

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 mb-5 flex-col sm:flex-row">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#00d992] uppercase tracking-widest mb-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00d992] animate-pulse" />
            Event Navigation Hub
          </div>
          <h2 className="text-lg font-bold text-white heading">Stage Roadmap</h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1.5">
            <div className="text-[10px] font-mono text-[#8b949e]">{completedCount} / {sorted.length} Complete</div>
            <div className="w-28 h-1.5 rounded-full bg-[#101010] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#00d992] to-[#34d399]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
              />
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => scroll('left')} disabled={!canLeft} className="h-8 w-8 rounded-xl bg-[#101010] border border-[#3d3a39] text-[#8b949e] hover:text-[#00d992] hover:border-[#00d992] flex items-center justify-center transition-all disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll('right')} disabled={!canRight} className="h-8 w-8 rounded-xl bg-[#101010] border border-[#3d3a39] text-[#8b949e] hover:text-[#00d992] hover:border-[#00d992] flex items-center justify-center transition-all disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Connector rail */}
      <div className="relative">
        <div className="absolute top-[52px] left-8 right-8 h-px bg-[#3d3a39] pointer-events-none hidden sm:block" />
        <motion.div
          className="absolute top-[52px] left-8 h-px bg-gradient-to-r from-[#00d992] to-[#34d399] pointer-events-none hidden sm:block"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.5 }}
        />

        <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory">
          {sorted.map((ev, idx) => {
            const cfg    = STAGE_CFG[idx] ?? STAGE_CFG[0];
            const status = getStatusMeta(ev.status);
            const Icon   = cfg.icon;
            const isHov  = hoveredIdx === idx;

            return (
              <motion.div
                key={ev.id}
                className="snap-start shrink-0 w-[195px] sm:w-[210px] flex flex-col items-center gap-3 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                onHoverStart={() => setHoveredIdx(idx)}
                onHoverEnd={() => setHoveredIdx(null)}
                onClick={() => handleCardClick(ev)}
              >
                {/* Stage node bubble */}
                <motion.div
                  className="relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black font-mono z-10"
                  style={{
                    borderColor: isHov ? cfg.color : '#3d3a39',
                    color:       isHov ? cfg.color : '#8b949e',
                    background:  isHov ? cfg.color + '20' : '#1a1a1a',
                    boxShadow:   isHov ? `0 0 22px ${cfg.glow}` : 'none',
                  }}
                  animate={{ scale: isHov ? 1.12 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {ev.status === 'Completed' ? <CheckCircle2 className="h-4 w-4" style={{ color: '#34d399' }} />
                   : ev.status === 'Locked'   ? <Lock className="h-4 w-4" style={{ color: '#ef4444' }} />
                   : ev.status === 'Active'   ? <Zap className="h-4 w-4" style={{ color: '#00d992' }} />
                   : `0${ev.order}`}
                </motion.div>

                {/* Card */}
                <motion.div
                  className="w-full rounded-2xl border p-3.5 flex flex-col gap-2.5"
                  style={{
                    borderColor: isHov ? cfg.color + '70' : '#3d3a39',
                    background:  isHov ? `linear-gradient(135deg, ${cfg.color}0d, #1a1a1a)` : '#1a1a1a',
                    boxShadow:   isHov ? `0 8px 32px ${cfg.glow}20` : 'none',
                    transition: 'all 0.25s ease',
                  }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border" style={{ borderColor: cfg.color + '40', background: cfg.color + '14' }}>
                      <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                    </div>
                    <span
                      className="flex items-center gap-1 text-[8px] font-mono font-black px-2 py-0.5 rounded-full border uppercase tracking-wider"
                      style={{ color: status.color, background: status.bg, borderColor: status.border }}
                    >
                      {status.pulse && <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: status.color }} />}
                      {status.label}
                    </span>
                  </div>

                  <div>
                    <div className="text-[9px] font-mono text-[#8b949e] uppercase tracking-widest leading-none mb-0.5">Stage {ev.order}</div>
                    <div className="text-sm font-semibold text-white leading-tight heading flex items-center justify-between">
                      <span>{ev.name}</span>
                      <Sparkles className="h-3 w-3 text-[#00d992] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isHov && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[11px] leading-relaxed overflow-hidden body-text text-[#f2f2f2]"
                      >
                        {ev.description}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {ev.isPaused && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
                      <Clock className="h-3 w-3" /><span>Paused</span>
                    </div>
                  )}

                  <div className="text-[9px] font-mono text-[#00d992] flex items-center gap-1 mt-1 opacity-80">
                    <span>Tap for module pop-up</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap mt-4 pt-4 border-t border-[#3d3a39]/60">
        {[
          { color: '#00d992', label: 'Active' },
          { color: '#34d399', label: 'Completed' },
          { color: '#f59e0b', label: 'Coming Soon' },
          { color: '#ef4444', label: 'Locked' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-[10px] font-mono text-[#8b949e]">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
        <div className="ml-auto text-[10px] font-mono text-[#3d3a39]">4 Stages · Score Sync Active</div>
      </div>

      {/* ── ROADMAP EVENT MODULE POPUP MODAL ────────────────────────────────── */}
      <AnimatePresence>
        {selectedModalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModalEvent(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative z-50 max-w-lg w-full bg-[#1a1a1a] border border-[#3d3a39] rounded-2xl p-6 shadow-2xl overflow-hidden font-mono space-y-5"
            >
              {/* Top Decorative Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d992] via-[#7c3aed] to-[#34d399]" />

              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00d992]/10 border border-[#00d992]/30 text-[#00d992]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#00d992] font-bold uppercase tracking-wider">
                      Stage 0{selectedModalEvent.order} Event Module
                    </div>
                    <h3 className="text-lg font-black text-white">{selectedModalEvent.name}</h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedModalEvent(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#101010] border border-[#3d3a39] text-[#8b949e] hover:text-white transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Architecture & Navigation Hub Banner (User Specified Text) */}
              <div className="rounded-xl border border-[#00d992]/30 bg-[#00d992]/8 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#00d992] font-bold">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>ZERONE 7.0 Central Navigation Hub</span>
                </div>
                <p className="text-[11px] text-[#dbdbdb] leading-relaxed font-sans">
                  The Roadmap serves as the central navigation hub for ZERONE 7.0, providing an overview of all event modules in their intended sequence. Each module represents a dedicated event website that will be integrated in future updates. As development progresses, selecting an event will redirect participants to its respective platform. Upon completion of an event, the corresponding website will automatically synchronize the team's scores with the ZERONE 7.0 Main Leaderboard, ensuring a unified event experience.
                </p>
              </div>

              {/* Module Operational Status */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#101010] p-3 rounded-xl border border-[#3d3a39]">
                  <div className="text-[9px] text-[#8b949e] uppercase font-bold">Module Status</div>
                  <div className="font-bold mt-1 text-[#00d992] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#00d992] animate-pulse" />
                    {selectedModalEvent.status}
                  </div>
                </div>

                <div className="bg-[#101010] p-3 rounded-xl border border-[#3d3a39]">
                  <div className="text-[9px] text-[#8b949e] uppercase font-bold">Score Sync Engine</div>
                  <div className="font-bold text-white mt-1 flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 text-[#34d399] animate-spin" />
                    Automated Sync Active
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#101010] p-3.5 rounded-xl border border-[#3d3a39]">
                <div className="text-[9px] text-[#8b949e] uppercase font-bold mb-1">Module Overview</div>
                <p className="text-xs text-[#ccc] font-sans leading-relaxed">{selectedModalEvent.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                {selectedModalEvent.status === 'Active' && selectedModalEvent.url ? (
                  <a
                    href={selectedModalEvent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#00d992] text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#2fd6a1] transition-all shadow-[0_0_20px_rgba(0,217,146,0.3)]"
                  >
                    <span>Launch Event Module Platform</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : selectedModalEvent.status === 'Active' ? (
                  <button
                    onClick={() => setSelectedModalEvent(null)}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#00d992] text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#2fd6a1] transition-all"
                  >
                    <span>Enter Event Arena</span>
                    <Zap className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-3 px-4 rounded-xl bg-[#101010] border border-[#3d3a39] text-[#8b949e] font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Clock className="h-4 w-4 text-[#f59e0b]" />
                    <span>Module Launch Pending — Standby</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedModalEvent(null)}
                  className="py-3 px-4 rounded-xl bg-[#101010] border border-[#3d3a39] text-[#8b949e] hover:text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
