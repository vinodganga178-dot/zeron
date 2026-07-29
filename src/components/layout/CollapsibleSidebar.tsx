'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, LogOut, Shield, Workflow, Users, Trophy,
  Settings, Activity, FileText, QrCode, Plus, Map, User, Menu
} from 'lucide-react';

export interface NavMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface CollapsibleSidebarProps {
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isPurple = themeColor === 'purple';

  const accentBg = isPurple ? 'bg-[#7c3aed]' : 'bg-[#00e5ff]';
  const accentText = isPurple ? 'text-[#a78bfa]' : 'text-[#00e5ff]';
  const accentBorder = isPurple ? 'border-[#7c3aed]/40' : 'border-[#00e5ff]/40';
  const activeBtnBg = isPurple
    ? 'bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.35)]'
    : 'bg-[#00e5ff] text-black shadow-[0_0_20px_rgba(0,229,255,0.35)]';

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <aside
      className={`sticky top-0 h-screen bg-[#0e0e12] border-r border-[#22222e] p-3.5 flex flex-col justify-between shrink-0 transition-all duration-300 select-none z-30 ${
        isCollapsed ? 'w-16 sm:w-20' : 'w-64 sm:w-72'
      }`}
    >
      <div className="space-y-6">
        {/* Top Header & Collapse Toggle */}
        <div className="flex items-center justify-between pb-2 border-b border-[#22222e]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accentBg} ${
                isPurple ? 'text-white' : 'text-black'
              } font-black text-xs shadow-md`}
            >
              {isPurple ? <Shield className="h-5 w-5" /> : <Workflow className="h-5 w-5" />}
            </div>

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="truncate font-mono"
              >
                <div className="text-xs font-black tracking-wider text-white flex items-center gap-1.5 truncate">
                  {title}{' '}
                  <span className={`text-[8px] ${accentText} bg-white/5 px-1.5 py-0.5 rounded border ${accentBorder} font-bold`}>
                    {roleTag}
                  </span>
                </div>
                <div className="text-[10px] text-[#666]">Control Plane</div>
              </motion.div>
            )}
          </div>

          {/* Minimize / Expand Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#181822] hover:bg-[#252535] border border-[#2d2d3d] text-[#aaa] hover:text-white transition-all shadow-sm"
            title={isCollapsed ? 'Expand Sidebar' : 'Minimize Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 font-mono text-xs">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
                  } py-3 rounded-xl font-bold transition-all ${
                    isActive ? activeBtnBg : 'text-[#888] hover:text-white hover:bg-[#1a1a24]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </span>

                  {!isCollapsed && item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-[#222] text-[#aaa]'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Hover Tooltip when Minimised */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 hidden group-hover:flex items-center gap-2 bg-[#1a1a24] border border-[#2d2d3d] text-white text-xs font-bold font-mono px-3 py-1.5 rounded-xl shadow-2xl pointer-events-none whitespace-nowrap">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-[#222] text-[#aaa]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info & Logout */}
      <div className="pt-3 border-t border-[#22222e] space-y-2 font-mono">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} overflow-hidden`}>
          <div className={`h-8 w-8 rounded-xl ${accentBg} text-black font-black flex items-center justify-center text-xs shrink-0`}>
            {userName.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-bold text-white text-xs truncate">{userName}</div>
              <div className="text-[10px] text-[#666] truncate">{userEmail}</div>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0' : 'justify-center gap-2 px-3'
          } bg-[#181822] hover:bg-red-500/10 border border-[#2d2d3d] hover:border-red-500/30 text-xs text-[#888] hover:text-red-400 py-2.5 rounded-xl transition-all font-bold`}
          title="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
