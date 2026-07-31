'use client';

import React, { useRef, useState, useEffect } from 'react';
import { EventControl } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Lightbulb, TrendingUp, Compass,
  ChevronLeft, ChevronRight, CheckCircle2, Lock, Zap, Clock,
} from 'lucide-react';

interface HorizontalRoadmapProps {
  events: EventControl[];
  onSelectEvent?: (event: EventControl) => void;
}

const STAGE_CFG = [
  { icon: HelpCircle,  color: '#a78bfa', glow: 'rgba(168,85,247,0.4)' },
  { icon: Lightbulb,   color: '#fbbf24', glow: 'rgba(251,191,36,0.4)' },
  { icon: TrendingUp,  color: '#00d992', glow: 'rgba(56,214,245,0.4)' },
  { icon: Compass,     color: '#34d399', glow: 'rgba(52,211,153,0.4)' },
];

function getStatusMeta(status: EventControl['status']) {
  switch (status) {
    case 'Active':     return { label: 'LIVE NOW',    color: '#00d992', bg: 'rgba(56,214,245,0.15)',  border: 'rgba(56,214,245,0.5)',  pulse: true  };
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

  return (
    <div className="relative w-full rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-5 sm:p-6 overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 h-56 w-56 rounded-full bg-[#7c3aed]/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#00d992]/5 blur-3xl" />

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 mb-5 flex-col sm:flex-row">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#00d992] uppercase tracking-widest mb-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00d992] animate-pulse" />
            Event Navigation Timeline
          </div>
          <h2 className="text-lg font-bold text-white heading">Stage Roadmap</h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1.5">
            <div className="text-[10px] font-mono text-[#8b949e]">{completedCount} / {sorted.length} Complete</div>
            <div className="w-28 h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#00d992] to-[#34d399]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
              />
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => scroll('left')} disabled={!canLeft} className="h-8 w-8 rounded-xl bg-[#1a1a1a] border border-[#3d3a39] text-[#8b949e] hover:text-[#00d992] hover:border-[#00d992] flex items-center justify-center transition-all disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll('right')} disabled={!canRight} className="h-8 w-8 rounded-xl bg-[#1a1a1a] border border-[#3d3a39] text-[#8b949e] hover:text-[#00d992] hover:border-[#00d992] flex items-center justify-center transition-all disabled:opacity-30">
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
                className="snap-start shrink-0 w-[195px] sm:w-[210px] flex flex-col items-center gap-3 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                onHoverStart={() => setHoveredIdx(idx)}
                onHoverEnd={() => setHoveredIdx(null)}
                onClick={() => onSelectEvent?.(ev)}
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
                    <div className="text-sm font-semibold text-white leading-tight heading">{ev.name}</div>
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
        <div className="ml-auto text-[10px] font-mono text-[#3d3a39]">4 Stages · Score API Integration</div>
      </div>
    </div>
  );
}
