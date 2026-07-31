'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';
import { Shield, Workflow, ArrowRight } from 'lucide-react';

export default function HeaderNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useZerone();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getDashboardUrl = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'admin') return '/admin/dashboard';
    if (currentUser.role === 'volunteer') return '/volunteer/dashboard';
    return null;
  };

  const dashboardUrl = getDashboardUrl();

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1280px,calc(100%-2rem))] pointer-events-none">
      <div className="pointer-events-auto bg-[#1a1a1a]/90 backdrop-blur-xl border border-[#3d3a39] rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-[0_8px_40px_rgba(2,6,19,0.9)]">
        {/* Brand Logo with Chip SVG */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group focus-visible:outline-2 focus-visible:outline-[#00d992] rounded-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#3d3a39] group-hover:border-[#00d992] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d992" strokeWidth="1.5">
              <rect x="4" y="4" width="16" height="16" rx="3" />
              <rect x="9" y="9" width="6" height="6" fill="#00d992" stroke="none" rx="1" />
              <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-black tracking-wider font-mono text-white leading-none group-hover:text-[#00d992] transition-colors">
              ZERONE <span className="text-[#00d992]">7.0</span>
            </div>
            <div className="text-[8px] text-[#00d992] tracking-[0.15em] uppercase font-mono leading-none mt-1">
              CO-POWERED BY IEEE KIDANGOOR
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[12px] font-mono font-bold text-[#8b949e]">
          <Link href="/volunteer/login" className="hover:text-[#00d992] transition-colors flex items-center gap-1.5">
            <span className="text-[10px] text-[#00d992] font-mono border border-[#00d992]/30 px-1.5 py-0.5 rounded bg-[#00d992]/10">01</span>
            <span>Volunteer Portal</span>
          </Link>
          <Link href="/admin/login" className="hover:text-[#7c3aed] transition-colors flex items-center gap-1.5">
            <span className="text-[10px] text-[#7c3aed] font-mono border border-[#7c3aed]/30 px-1.5 py-0.5 rounded bg-[#7c3aed]/10">02</span>
            <span>Admin Console</span>
          </Link>
        </nav>

        {/* Live Clock & Action Button */}
        <div className="flex items-center gap-3">
          {timeStr && (
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[#8b949e] bg-[#1a1a1a] border border-[#3d3a39] px-3 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d992] blink" />
              <span>{timeStr}</span>
            </div>
          )}

          {dashboardUrl ? (
            <button
              onClick={() => router.push(dashboardUrl)}
              className="px-4 py-2 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider bg-[#00d992] text-[#101010] hover:bg-[#b8b3b0] transition-all shadow-[0_0_20px_rgba(56,214,245,0.4)]"
            >
              Control Panel
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth?mode=signin"
                className="text-[12px] font-mono font-semibold text-[#8b949e] hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-[#1a1a1a]"
              >
                Sign In
              </Link>
              <Link
                href="/auth?mode=register"
                className="px-4 py-2 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider bg-[#00d992] text-[#101010] hover:bg-[#b8b3b0] transition-all shadow-[0_0_25px_rgba(56,214,245,0.45)] hover:scale-[1.02] flex items-center gap-1.5"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
