'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Shield, Workflow, Users, Trophy, Settings, LogOut,
  Activity, ChevronRight, User, Home, ChevronLeft
} from 'lucide-react';

export interface NavMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export interface CollapsibleSidebarProps {
  title: string;
  roleTag: string;
  themeColor: 'purple' | 'cyan';
  menuItems: NavMenuItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export default function CollapsibleSidebar({
  title,
  roleTag,
  themeColor,
  menuItems,
  activeTab,
  onSelectTab,
  userName,
  userEmail,
  onLogout,
}: CollapsibleSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isPurple = themeColor === 'purple';

  const accentBg = isPurple ? 'bg-[#7c3aed]' : 'bg-[#00d992]';
  const accentText = isPurple ? 'text-[#a78bfa]' : 'text-[#00d992]';
  const accentBorder = isPurple ? 'border-[#7c3aed]/40' : 'border-[#00d992]/40';
  const activeBtnBg = isPurple
    ? 'bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.35)]'
    : 'bg-[#00d992] text-[#101010] shadow-[0_0_20px_rgba(0,217,146,0.35)]';

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* ── MOBILE TOP BAR (Fixed on Mobile Screens) ────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-[#3d3a39] px-4 py-3 flex items-center justify-between font-mono shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#101010] border border-[#3d3a39] text-white active:scale-95 transition-all"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5 text-[#00d992]" />
          </button>

          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${accentBg} ${isPurple ? 'text-white' : 'text-black'} font-black text-xs`}>
              {isPurple ? <Shield className="h-4 w-4" /> : <Workflow className="h-4 w-4" />}
            </div>
            <div>
              <div className="text-xs font-black text-white leading-none">
                {title} <span className={`text-[8px] ${accentText} bg-[#101010] px-1 py-0.5 rounded border ${accentBorder}`}>{roleTag}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Active Tab Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8b949e] bg-[#101010] px-2.5 py-1 rounded-lg border border-[#3d3a39]">
          <span className={`w-1.5 h-1.5 rounded-full ${isPurple ? 'bg-[#7c3aed]' : 'bg-[#00d992]'} animate-pulse`} />
          <span className="text-white font-bold uppercase truncate max-w-[90px]">{activeTab}</span>
        </div>
      </div>

      {/* Spacer for Fixed Mobile Top Bar */}
      <div className="md:hidden h-14 w-full shrink-0" />

      {/* ── MOBILE SLIDING DRAWER MENU ─────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden"
            />

            {/* Sliding Aside Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-[#1a1a1a] border-r border-[#3d3a39] p-5 flex flex-col justify-between shadow-2xl font-mono md:hidden"
            >
              <div className="space-y-5">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-[#3d3a39] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentBg} ${isPurple ? 'text-white' : 'text-black'} font-black text-xs`}>
                      {isPurple ? <Shield className="h-5 w-5" /> : <Workflow className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">{title}</div>
                      <div className="text-[10px] text-[#8b949e]">{roleTag} Control Panel</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-xl bg-[#101010] text-[#8b949e] hover:text-white border border-[#3d3a39]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile Menu Nav Items */}
                <nav className="space-y-1.5 text-xs">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-all ${
                          isActive ? activeBtnBg : 'text-[#8b949e] hover:text-white hover:bg-[#101010]'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className={`text-[9px] px-2 py-0.5 rounded-md border font-mono ${item.badgeColor || 'bg-[#101010] text-[#8b949e] border-[#3d3a39]'}`}>
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

              {/* User Profile & Logout Section */}
              <div className="pt-4 border-t border-[#3d3a39] space-y-3">
                <div className="flex items-center gap-3 bg-[#101010] p-2.5 rounded-xl border border-[#3d3a39]">
                  <div className={`h-8 w-8 rounded-lg ${accentBg} text-black font-black flex items-center justify-center text-xs shrink-0`}>
                    {userName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-xs truncate">{userName}</div>
                    <div className="text-[10px] text-[#8b949e] truncate">{userEmail}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#101010] hover:bg-red-500/10 border border-[#3d3a39] hover:border-red-500/30 text-xs text-[#8b949e] hover:text-red-400 py-2.5 rounded-xl transition-all font-bold"
                >
                  <LogOut className="h-4 w-4" /> Logout Session
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP SIDEBAR (Permanent Left Panel on Medium+ Screens) ──────── */}
      <aside className={`hidden md:flex flex-col justify-between shrink-0 bg-[#1a1a1a] border-r border-[#3d3a39] p-5 min-h-screen font-mono transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-[#3d3a39] pb-4">
            {!isCollapsed && (
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentBg} ${isPurple ? 'text-white' : 'text-black'} font-black text-xs shadow-md`}>
                  {isPurple ? <Shield className="h-5 w-5" /> : <Workflow className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-xs font-black text-white leading-none">
                    {title} <span className={`text-[8px] ${accentText} bg-[#101010] px-1 py-0.5 rounded border ${accentBorder}`}>{roleTag}</span>
                  </div>
                  <div className="text-[9px] text-[#8b949e] mt-1">Control Plane</div>
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentBg} ${isPurple ? 'text-white' : 'text-black'} font-black text-xs mx-auto`}>
                {isPurple ? <Shield className="h-5 w-5" /> : <Workflow className="h-5 w-5" />}
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg bg-[#101010] border border-[#3d3a39] text-[#8b949e] hover:text-white transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="space-y-1.5 text-xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-3 rounded-xl font-bold transition-all ${
                    isActive ? activeBtnBg : 'text-[#8b949e] hover:text-white hover:bg-[#101010]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </span>
                  {!isCollapsed && item.badge && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-md border font-mono ${item.badgeColor || 'bg-[#101010] text-[#8b949e] border-[#3d3a39]'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="pt-4 border-t border-[#3d3a39] space-y-3">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 bg-[#101010] p-2.5 rounded-xl border border-[#3d3a39]">
                <div className={`h-8 w-8 rounded-lg ${accentBg} text-black font-black flex items-center justify-center text-xs shrink-0`}>
                  {userName.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="font-bold text-white text-xs truncate">{userName}</div>
                  <div className="text-[10px] text-[#8b949e] truncate">{userEmail}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-[#101010] hover:bg-red-500/10 border border-[#3d3a39] hover:border-red-500/30 text-xs text-[#8b949e] hover:text-red-400 py-2.5 rounded-xl transition-all font-bold"
              >
                <LogOut className="h-4 w-4" /> Logout Session
              </button>
            </>
          ) : (
            <button
              onClick={onLogout}
              title="Logout"
              className="w-full flex items-center justify-center h-10 rounded-xl bg-[#101010] border border-[#3d3a39] text-[#8b949e] hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ── FLOATING MOBILE BOTTOM NAVIGATION BAR ──────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a]/95 backdrop-blur-xl border-t border-[#3d3a39] px-2 py-1.5 flex items-center justify-around font-mono shadow-2xl">
        {menuItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? isPurple
                    ? 'text-[#a78bfa] bg-[#7c3aed]/15 font-bold'
                    : 'text-[#00d992] bg-[#00d992]/15 font-bold'
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span className="text-[9px] uppercase tracking-tighter truncate max-w-[65px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
