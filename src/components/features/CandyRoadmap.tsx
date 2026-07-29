'use client';

import React, { useState } from 'react';
import { EventControl } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Lightbulb, TrendingUp, Compass, Lock, Check,
  ChevronRight, ExternalLink, Sparkles, Circle, ShieldCheck
} from 'lucide-react';

interface CandyRoadmapProps {
  events: EventControl[];
  onSelectEvent?: (event: EventControl) => void;
}

export default function CandyRoadmap({ events, onSelectEvent }: CandyRoadmapProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventControl | null>(null);

  // Sort events by order
  const sortedEvents = [...events].sort((a, b) => a.order - b.order);

  // Elegant Lucide SVG vector symbols for each stage (No Emojis!)
  const stageIcons = [
    { key: 'quiz', icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', ring: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]' },
    { key: 'pitch', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', ring: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]' },
    { key: 'sell', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', ring: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]' },
    { key: 'treasure', icon: Compass, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', ring: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]' },
  ];

  const handleSelect = (ev: EventControl) => {
    setSelectedEvent(ev);
    if (onSelectEvent) onSelectEvent(ev);
  };

  return (
    <div className="relative w-full rounded-2xl border border-[#222] bg-[#0c0c0e] p-6 sm:p-8 font-sans select-none overflow-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#1f1f24] pb-6 mb-8 gap-4">
        <div>
          <div className="text-[11px] font-mono font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed] animate-pulse" />
            Event Navigation Timeline
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-mono tracking-tight mt-1">
            Stage Roadmap
          </h2>
        </div>
        <div className="text-xs font-mono text-[#666]">
          4 Independent Event Websites · Score Integration API
        </div>
      </div>

      {/* Winding / Connected Stage Path Layout */}
      <div className="relative max-w-3xl mx-auto py-4">
        {/* Connecting Vertical Line for desktop/mobile */}
        <div className="absolute top-8 bottom-8 left-6 sm:left-1/2 w-0.5 bg-[#1f1f28] -translate-x-1/2 pointer-events-none" />

        <div className="space-y-8 sm:space-y-12">
          {sortedEvents.map((ev, index) => {
            const theme = stageIcons[index % stageIcons.length];
            const IconComponent = theme.icon;
            const isEven = index % 2 === 0;

            const isLocked = ev.status === 'Locked';
            const isActive = ev.status === 'Active';
            const isCompleted = ev.status === 'Completed';

            return (
              <div
                key={ev.id}
                onClick={() => handleSelect(ev)}
                className="relative flex flex-col sm:flex-row items-start sm:items-center group cursor-pointer"
              >
                {/* Central Geometric Icon Pin */}
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-20">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${theme.bg} ${
                      isActive ? `${theme.ring} ring-2 ring-white/20 bg-[#16161f]` : 'bg-[#0f0f14]'
                    } transition-all duration-300 group-hover:scale-110`}
                  >
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-red-400/80" />
                    ) : isCompleted ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <IconComponent className={`h-5 w-5 ${theme.color}`} />
                    )}
                  </div>
                </div>

                {/* Left Side Content (Even on desktop) */}
                <div className={`w-full sm:w-1/2 pl-16 sm:pl-0 ${isEven ? 'sm:pr-12 sm:text-right' : 'sm:pl-12 sm:order-2 sm:text-left'}`}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-xl border border-[#1f1f28] bg-[#121217]/90 hover:border-[#333] transition-all space-y-2 shadow-lg"
                  >
                    <div className={`flex items-center gap-2 ${isEven ? 'sm:justify-end' : 'sm:justify-start'}`}>
                      <span className="text-[10px] font-mono font-bold text-[#888] uppercase">
                        STAGE 0{ev.order}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase border ${
                        isActive ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        isLocked ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        isCompleted ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {ev.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#00e5ff] transition-colors font-mono">
                      {ev.name}
                    </h3>
                    <p className="text-xs text-[#777] line-clamp-2 leading-relaxed">{ev.description}</p>

                    <div className={`pt-2 flex items-center text-[10px] font-mono text-[#00e5ff] font-bold ${isEven ? 'sm:justify-end' : 'sm:justify-start'}`}>
                      <span>View Stage Details</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </div>

                {/* Empty Balancing Spacer for desktop grid alignment */}
                <div className={`hidden sm:block w-1/2 ${isEven ? 'order-2' : 'order-1'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Elegant Stage Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121217] border border-[#262630] rounded-2xl max-w-md w-full p-6 space-y-5 font-mono text-left shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                <div className="flex items-center gap-3">
                  {React.createElement(stageIcons[(selectedEvent.order - 1) % stageIcons.length].icon, {
                    className: `h-6 w-6 ${stageIcons[(selectedEvent.order - 1) % stageIcons.length].color}`,
                  })}
                  <div>
                    <span className="text-[10px] text-[#7c3aed] font-bold uppercase">STAGE 0{selectedEvent.order}</span>
                    <h3 className="text-base font-bold text-white">{selectedEvent.name}</h3>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase border ${
                  selectedEvent.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                  selectedEvent.status === 'Locked' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {selectedEvent.status}
                </span>
              </div>

              <p className="text-xs text-[#888] leading-relaxed">{selectedEvent.description}</p>

              <div className="rounded-xl bg-[#09090c] border border-[#222] p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#666]">Architecture</span>
                  <span className="text-white font-bold">Independent Event Website</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Score Integration API</span>
                  <span className="text-green-400 font-bold">POST /api/teams/[id]/score</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Event URL</span>
                  <span className="text-[#00e5ff] truncate max-w-[180px]">
                    {selectedEvent.url || 'Not configured'}
                  </span>
                </div>
              </div>

              {selectedEvent.url && selectedEvent.status === 'Active' ? (
                <a
                  href={selectedEvent.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#00e5ff] hover:bg-[#00c8e0] text-black font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,255,0.25)]"
                >
                  Launch Event Website <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs text-center font-bold">
                  🔒 Event website opens when marked Active by Admin.
                </div>
              )}

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full bg-[#1a1a20] hover:bg-[#22222a] text-[#aaa] hover:text-white font-bold py-2.5 rounded-xl text-xs border border-[#333] transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
