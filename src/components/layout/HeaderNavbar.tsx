'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function HeaderNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useZerone();
  const [timeStr, setTimeStr] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="pointer-events-auto bg-[#08080c]/85 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-200">
        {/* Brand Logo with Chip SVG */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 group focus-visible:outline-2 focus-visible:outline-[#00e5ff] rounded-lg transition-transform active:scale-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c0c10] border border-white/10 group-hover:border-[#00e5ff] transition-colors shadow-inner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5">
              <rect x="4" y="4" width="16" height="16" rx="3" />
              <rect x="9" y="9" width="6" height="6" fill="#00e5ff" stroke="none" rx="1" />
              <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-black tracking-wider font-mono text-white leading-none group-hover:text-[#00e5ff] transition-colors">
              ZERONE <span className="text-[#00e5ff]">7.0</span>
            </div>
            <div className="text-[8px] text-[#00e5ff] tracking-[0.15em] uppercase font-mono leading-none mt-1 opacity-90">
              CO-POWERED BY IEEE KIDANGOOR
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[12px] font-mono font-bold text-[#94a3b8]">
          <Link
            href="/volunteer/login"
            className="hover:text-[#00e5ff] transition-colors flex items-center gap-1.5 group py-1"
          >
            <span className="text-[10px] text-[#00e5ff] font-mono border border-[#00e5ff]/30 px-1.5 py-0.5 rounded bg-[#00e5ff]/10 group-hover:bg-[#00e5ff] group-hover:text-[#050505] transition-colors">
              01
            </span>
            <span>Volunteer Portal</span>
          </Link>
          <Link
            href="/admin/login"
            className="hover:text-[#7c3aed] transition-colors flex items-center gap-1.5 group py-1"
          >
            <span className="text-[10px] text-[#7c3aed] font-mono border border-[#7c3aed]/30 px-1.5 py-0.5 rounded bg-[#7c3aed]/10 group-hover:bg-[#7c3aed] group-hover:text-white transition-colors">
              02
            </span>
            <span>Admin Console</span>
          </Link>
        </nav>

        {/* Live Clock & Action Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {timeStr && (
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[#94a3b8] bg-[#0c0c10] border border-white/10 px-3 py-1.5 rounded-xl shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] blink" />
              <span className="tabular-nums">{timeStr}</span>
            </div>
          )}

          {dashboardUrl ? (
            <button
              onClick={() => router.push(dashboardUrl)}
              className="btn-ink !py-2 !px-4 !text-[11px] font-mono font-black uppercase tracking-wider !rounded-xl !bg-[#00e5ff] !text-[#050505] hover:!bg-[#33ebff]"
            >
              Control Panel
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/auth?mode=signin"
                className="text-[12px] font-mono font-semibold text-[#94a3b8] hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                href="/auth?mode=register"
                className="btn-ink !py-2 !px-4 !text-[11px] font-mono font-black uppercase tracking-wider !rounded-xl !bg-[#00e5ff] !text-[#050505] hover:!bg-[#33ebff] flex items-center gap-1.5"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#0c0c10] border border-white/10 text-[#94a3b8] hover:text-white hover:border-[#00e5ff] transition-all"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 pointer-events-auto bg-[#08080c]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-3 font-mono text-xs shadow-2xl animate-in slide-in-from-top-2">
          <Link
            href="/volunteer/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-[#050505] border border-white/10 text-white font-bold hover:border-[#00e5ff] transition-colors"
          >
            <span>01 · Volunteer Portal</span>
            <ArrowRight className="h-4 w-4 text-[#00e5ff]" />
          </Link>
          <Link
            href="/admin/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-[#050505] border border-white/10 text-white font-bold hover:border-[#7c3aed] transition-colors"
          >
            <span>02 · Admin Console</span>
            <ArrowRight className="h-4 w-4 text-[#7c3aed]" />
          </Link>
          {!dashboardUrl && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <Link
                href="/auth?mode=signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth?mode=register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-[#00e5ff] text-[#050505] font-bold hover:bg-[#33ebff] transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
