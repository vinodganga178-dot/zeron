'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Shield, Workflow, Users, Trophy, Settings, LogOut,
  Activity, FileText, QrCode, Plus, Map, User, ChevronRight, Zap
} from 'lucide-react';

export interface NavMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface HamburgerSidebarProps {
  title: string;
  subtitle: string;
  roleTag: string;
  themeColor: 'purple' | 'cyan';
  menuItems: NavMenuItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export default function HamburgerSidebar({
  title,
  subtitle,
  roleTag,
  themeColor,
  menuItems,
  activeTab,
  onSelectTab,
  userName,
  userEmail,
  onLogout,
}: HamburgerSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isPurple = themeColor === 'purple';

  const accentBg = isPurple ? 'bg-[#7c3aed]' : 'bg-[#00d992]';
  const accentText = isPurple ? 'text-[#a78bfa]' : 'text-[#00d992]';
  const accentBorder = isPurple ? 'border-[#7c3aed]/40' : 'border-[#00d992]/40';
  const activeBtnBg = isPurple ? 'bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.35)]' : 'bg-[#00d992] text-[#101010] shadow-[0_0_20px_rgba(56,214,245,0.4)]';

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setIsOpen(false); // auto-close drawer on mobile selection
  };

  return (
    <>
      {/* Sticky Top Bar with Hamburger Trigger */}
      <header className="sticky top-0 z-40 w-full bg-[#1a1a1a]/90 backdrop-blur-xl border-b border-[#3d3a39] px-4 sm:px-6 py-3 flex items-center justify-between font-mono">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1a1a] hover:bg-[#3d3a39] border border-[#3d3a39] text-white transition-all shadow-md active:scale-95"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentBg} ${isPurple ? 'text-white' : 'text-[#101010]'} font-black text-xs shadow-md`}>
              {isPurple ? <Shield className="h-4 w-4" /> : <Workflow className="h-4 w-4" />}
            </div>
            <div>
              <div className="text-xs font-black tracking-wider font-mono text-white flex items-center gap-1.5">
                {title} <span className={`text-[9px] ${accentText} bg-[#1a1a1a] px-1.5 py-0.5 rounded border ${accentBorder} font-bold`}>{roleTag}</span>
              </div>
              <div className="text-[10px] text-[#00d992] font-mono font-bold">CO-POWERED BY IEEE KIDANGOOR</div>
            </div>
          </div>
        </div>

        {/* Current Active Tab Label Indicator */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#8b949e]">
          <span className="h-2 w-2 rounded-full bg-[#00d992] pulse-dot" />
          <span className="text-white font-bold uppercase">{activeTab}</span>
        </div>
      </header>

      {/* Sliding Hamburger Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />

            {/* Sliding Sidebar Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-[#1a1a1a] border-r border-[#3d3a39] p-6 flex flex-col justify-between shadow-2xl font-mono"
            >
              <div className="space-y-6">
                {/* Drawer Header with Close Button */}
                <div className="flex items-center justify-between border-b border-[#222230] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentBg} ${isPurple ? 'text-white' : 'text-black'} font-black text-xs`}>
                      {isPurple ? <Shield className="h-4 w-4" /> : <Workflow className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">{title}</div>
                      <div className="text-[10px] text-[#666]">{roleTag} Navigation</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#1c1c26] text-[#888] hover:text-white border border-[#2d2d3d] transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-1.5 text-xs">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                          isActive ? activeBtnBg : 'text-[#888] hover:text-white hover:bg-[#1a1a24]'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-[#222] text-[#aaa]'}`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={`h-3.5 w-3.5 opacity-60 ${isActive ? 'translate-x-0.5' : ''}`} />
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* User Profile & Logout */}
              <div className="pt-4 border-t border-[#222230] space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl ${accentBg} text-black font-black flex items-center justify-center text-xs shrink-0`}>
                    {userName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-xs truncate">{userName}</div>
                    <div className="text-[10px] text-[#666] truncate">{userEmail}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#1c1c26] hover:bg-red-500/10 border border-[#2d2d3d] hover:border-red-500/30 text-xs text-[#888] hover:text-red-400 py-2.5 rounded-xl transition-all font-bold"
                >
                  <LogOut className="h-4 w-4" /> Logout Session
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
