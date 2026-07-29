'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';
import Terminal from '@/components/ui/Terminal';
import {
  ArrowRight,
  Shield,
  Workflow,
  Radio,
  Activity,
  Globe,
  Award,
  Zap,
  LayoutDashboard,
  Cpu,
  Clock,
  Terminal as TerminalIcon,
  Users,
} from 'lucide-react';

// ── Stage data ────────────────────────────────────────────────────────────────
const stages = [
  { num: '01', title: 'Registration', type: 'Launch',   icon: Users,        color: '#00d992' },
  { num: '02', title: 'Quiz Round',   type: '15 min',   icon: Clock,        color: '#00e5ff' },
  { num: '03', title: 'Puzzle Round', type: '30 min',   icon: Cpu,          color: '#7c3aed' },
  { num: '04', title: 'Treasure Hunt',type: '45 min',   icon: Globe,        color: '#00e5ff' },
  { num: '05', title: 'Submission',   type: '120 min',  icon: TerminalIcon, color: '#00d992' },
  { num: '06', title: 'Pitch Round',  type: '10 min',   icon: Activity,     color: '#3b82f6' },
  { num: '07', title: 'Final Showdown',type:'Live',     icon: Award,        color: '#f97316' },
];

// ── Portal card ───────────────────────────────────────────────────────────────
function PortalCard({ icon: Icon, title, description, accentColor, nodeId, coords, linkLabel, onClick }: {
  icon: React.ElementType; title: string; description: string;
  accentColor: string; nodeId: string; coords: string; linkLabel: string; onClick: () => void;
}) {
  return (
    <div
      className="group relative flex flex-col justify-between rounded-2xl border border-[#2a2a2a] bg-[#111] p-7 sm:p-8 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1.5 min-h-[260px]"
      onClick={onClick}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = `${accentColor}60`;
        el.style.boxShadow = `0 0 60px ${accentColor}14, 0 20px 40px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.borderColor = '';
        el.style.boxShadow = '';
      }}
    >
      <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out" style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }} />
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" style={{ backgroundColor: accentColor }} />

      <div>
        <div className="module-meta mb-6">
          <span className="led blink" style={{ background: accentColor }} />
          <span className="font-bold text-white">{nodeId}</span>
          <span>·</span>
          <span style={{ color: accentColor }}>ONLINE</span>
          <span className="ml-auto text-[#444] font-mono">{coords}</span>
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl border mb-5 group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}35`, color: accentColor }}
        >
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">{title}</h3>
        <p className="text-xs sm:text-sm text-[#777] mt-2.5 leading-relaxed group-hover:text-[#aaa] transition-colors">{description}</p>
      </div>

      <button className="flex items-center gap-2 text-xs sm:text-sm font-bold mt-7 transition-all duration-200 group/btn" style={{ color: accentColor }}>
        {linkLabel}
        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-transform duration-200" />
      </button>
    </div>
  );
}

// ── Feature mini-card ─────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, label, desc, color }: {
  icon: React.ElementType; label: string; desc: string; color: string;
}) {
  return (
    <div className="panel corner-ticks p-4 sm:p-5 hover:-translate-y-1 transition-all duration-300 hover:border-current group/fc" style={{ ['--fc-color' as string]: color }}>
      <div className="absolute top-0 left-0 h-[2px] w-0 group-hover/fc:w-14 transition-all duration-500 rounded-t" style={{ background: color }} />
      <div className="flex h-9 w-9 items-center justify-center rounded-xl mb-3 border transition-all duration-300" style={{ backgroundColor: `${color}10`, borderColor: `${color}28`, color }}>
        <Icon className="h-4 w-4" />
      </div>
      <h4 className="text-xs font-bold text-white">{label}</h4>
      <p className="text-[10px] text-[#555] mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════
export default function Home() {
  const router = useRouter();
  const { currentUser, auditLogs, teams, volunteers } = useZerone();

  const [clock, setClock] = useState('--:--:--');

  const cursorDotRef   = useRef<HTMLDivElement>(null);
  const cursorRingRef  = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const spotlightRef   = useRef<HTMLDivElement>(null);

  const totalTeams = Object.keys(teams).length;
  const totalVolunteers = Object.keys(volunteers).length;
  const totalStudents = Object.values(teams).reduce((acc, t) => acc + (t.members ? t.members.length : 0), 0);
  const totalGroups = totalTeams;


  // Live clock
  useEffect(() => {
    const tick = () => setClock(new Date().toTimeString().slice(0, 8));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Custom cursor & mouse spotlight using direct DOM manipulation (zero React re-renders)
  useEffect(() => {
    const dot  = cursorDotRef.current;
    const ring = cursorRingRef.current;
    const spot = spotlightRef.current;
    if (!dot || !ring) return;

    let dotX = 0, dotY = 0, ringX = 0, ringY = 0;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
      if (spot) {
        const px = ((e.clientX / window.innerWidth) * 100).toFixed(1);
        const py = ((e.clientY / window.innerHeight) * 100).toFixed(1);
        spot.style.background = `radial-gradient(360px 360px at ${px}% ${py}%, rgba(255,255,255,0.035), transparent 70%)`;
      }
    };

    const animate = () => {
      dot.style.left  = dotX + 'px';
      dot.style.top   = dotY + 'px';
      ringX += (dotX - ringX) * 0.15;
      ringY += (dotY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    animId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Progress bar on mount
  useEffect(() => {
    const bar = progressBarRef.current;
    if (!bar) return;
    requestAnimationFrame(() => {
      bar.style.transition = 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
      bar.style.transform  = 'scaleX(1)';
    });
  }, []);

  // Scroll reveal IntersectionObserver
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal-hidden');
    const io = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = parseInt(el.dataset.delay ?? '0', 10);
          setTimeout(() => el.classList.add('is-visible'), delay);
          io.unobserve(el);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Sector bar fill on scroll
  useEffect(() => {
    const bars = document.querySelectorAll<HTMLElement>('.sector-fill[data-width]');
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        (entry.target as HTMLElement).style.width = (entry.target as HTMLElement).dataset.width ?? '0%';
        io.unobserve(entry.target);
      }
    }), { threshold: 0.5 });
    bars.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Get user dashboard link if logged in
  const getDashboardUrl = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'admin')     return '/admin/dashboard';
    if (currentUser.role === 'volunteer') return '/volunteer/dashboard';
    return null;
  };
  const dashUrl = getDashboardUrl();

  return (
    <div className="relative min-h-screen bg-[#0a0a0b] overflow-x-hidden text-[#f2f2f2]" style={{ cursor: 'none' }}>

      {/* Custom Cursor */}
      <div ref={cursorDotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={cursorRingRef} className="cursor-ring" aria-hidden="true" />

      {/* Page Load Progress Bar */}
      <div
        ref={progressBarRef}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[2px] z-[70]"
        style={{ background: 'linear-gradient(90deg,var(--blue),var(--cyan),var(--green))', transformOrigin: '0 50%', transform: 'scaleX(0)' }}
      />

      {/* ── Background System ─────────────────────────────── */}
      <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Fine grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right,rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.025) 1px,transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 85% 65% at 50% 25%, black 20%, transparent 100%)',
        }} />
        {/* Coarse grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right,rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.05) 1px,transparent 1px)',
          backgroundSize: '120px 120px',
          maskImage: 'radial-gradient(ellipse 85% 65% at 50% 25%, black 20%, transparent 100%)',
        }} />
        {/* Ambient color blobs */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(800px 500px at 15% -5%, rgba(59,130,246,0.09), transparent 60%),' +
            'radial-gradient(600px 400px at 92% 10%, rgba(0,229,255,0.055), transparent 60%),' +
            'radial-gradient(700px 500px at 50% 110%, rgba(124,58,237,0.06), transparent 60%)',
        }} />
        {/* Animated SVG blueprint lines */}
        <svg className="blueprint-anim absolute inset-0 w-full h-full" style={{ opacity: 0.13 }} viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path className="draw-stroke" d="M-20 200 H200 l50 50 H500 l40 -40 H780 v140 l60 60 H1080" stroke="#00e5ff" strokeWidth="1" />
          <path className="draw-stroke" style={{ animationDelay: '0.6s' }} d="M1460 660 H1160 l-50 -50 H860 l-40 40 H580 v-100 l-60 -60 H300" stroke="#3b82f6" strokeWidth="1" />
          <path className="draw-stroke" style={{ animationDelay: '1.1s' }} d="M160 900 V740 l70 -70 H480 v-140" stroke="#7c3aed" strokeWidth="1" />
          <g stroke="#00e5ff" strokeWidth="0.6" opacity="0.5">
            <line x1="200" y1="196" x2="200" y2="204" /><line x1="196" y1="200" x2="204" y2="200" />
            <line x1="780" y1="296" x2="780" y2="304" /><line x1="776" y1="300" x2="784" y2="300" />
          </g>
          <g stroke="#3b82f6" strokeWidth="0.6" opacity="0.5">
            <line x1="1160" y1="606" x2="1160" y2="614" /><line x1="1156" y1="610" x2="1164" y2="610" />
            <line x1="580" y1="550" x2="580" y2="558" /><line x1="576" y1="554" x2="584" y2="554" />
          </g>
          <circle cx="200" cy="200" r="2.5" fill="#00e5ff" opacity="0.8" />
          <circle cx="780" cy="300" r="2.5" fill="#00e5ff" opacity="0.6" />
          <circle cx="1160" cy="610" r="2.5" fill="#3b82f6" opacity="0.8" />
          <circle cx="580" cy="554" r="2.5" fill="#3b82f6" opacity="0.6" />
          <circle cx="480" cy="530" r="2.5" fill="#7c3aed" opacity="0.7" />
          <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.8">
            <line x1="80" y1="130" x2="80" y2="142" /><line x1="80" y1="136" x2="220" y2="136" /><line x1="220" y1="130" x2="220" y2="142" />
          </g>
          <text x="135" y="128" fill="rgba(255,255,255,0.22)" fontSize="8" fontFamily="monospace">140.00mm</text>
        </svg>
        <div ref={spotlightRef} className="absolute inset-0" style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} />
      </div>

      {/* ── Floating Pill Navbar ──────────────────────────── */}
      <header
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1280px,calc(100%-2rem))]"
        style={{ animation: 'fade-slide-up 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <div className="bg-[#0a0a0b]/88 backdrop-blur-2xl border border-[rgba(255,255,255,0.09)] rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5">
                <rect x="4" y="4" width="16" height="16" rx="3" />
                <rect x="9" y="9" width="6" height="6" fill="var(--cyan)" stroke="none" rx="1" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
              </svg>
              <div className="absolute inset-0 rounded-lg" style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.15), transparent 70%)' }} />
            </div>
            <div className="hidden sm:block">
              <div className="text-[13px] font-black tracking-tight text-mono leading-none">
                IEEE <span style={{ color: 'var(--cyan)' }}>ZERONE</span>
              </div>
              <div className="text-[8px] text-[#444] tracking-[0.2em] uppercase text-mono leading-none mt-0.5">v7.0 · 2026</div>
            </div>
          </a>

          <div className="w-px h-5 bg-[rgba(255,255,255,0.08)]" />

          {/* Nav links — Admin & Volunteer focus */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => router.push('/volunteer/login')}
              className="relative group flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-[#a8a8a8] hover:text-white transition-all duration-200"
            >
              <span className="relative text-mono text-[9px] px-1.5 py-0.5 rounded font-bold bg-[#1a1a1a] text-[#00e5ff]">
                01
              </span>
              <span className="relative font-medium">Volunteer Portal</span>
            </button>
            <button
              onClick={() => router.push('/admin/login')}
              className="relative group flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-[#a8a8a8] hover:text-white transition-all duration-200"
            >
              <span className="relative text-mono text-[9px] px-1.5 py-0.5 rounded font-bold bg-[#1a1a1a] text-[#7c3aed]">
                02
              </span>
              <span className="relative font-medium">Admin Console</span>
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Live clock */}
            <span className="hidden lg:flex items-center gap-2 px-2 text-mono text-[10px] tracking-wider text-[#a8a8a8]">
              <span className="led led-green blink" />
              <span className="text-num tabular" style={{ color: 'var(--green)' }}>{clock}</span>
            </span>

            {dashUrl ? (
              <button
                onClick={() => router.push(dashUrl)}
                className="flex items-center gap-1.5 bg-[#00d992]/10 border border-[#00d992]/30 text-[#00d992] hover:bg-[#00d992]/20 font-bold px-3 py-1.5 rounded-lg text-[12px] transition-all"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                DASHBOARD
              </button>
            ) : (
              <button
                onClick={() => router.push('/volunteer/login')}
                className="btn-ink btn-swap !py-1.5 !px-5 !text-[12px] !min-h-9"
              >
                <span className="swap-a flex items-center gap-1.5">
                  VOLUNTEER LOGIN
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
                <span className="swap-b font-mono text-[11px]">ACCESS…</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="relative pt-36 pb-16 min-h-[100dvh] flex flex-col justify-center overflow-hidden" style={{ zIndex: 10 }}>
        <div className="max-w-[1280px] mx-auto px-6 w-full">

          {/* System status bar */}
          <div className="module-meta mb-10 flex-wrap" style={{ animation: 'fade-slide-up 0.6s 0.3s both' }}>
            <span className="led led-green blink" />
            <span style={{ color: 'var(--fg-2)' }}>IEEE / ZERONE 7.0</span>
            <span>·</span>
            <span>CONTROL PLANE</span>
            <span>·</span>
            <span style={{ color: 'var(--cyan)' }}>ALL SYSTEMS NOMINAL</span>
            <span className="ml-auto hidden md:inline text-[#333]">GRID_X09 · 28.07.2026</span>
          </div>

          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Left — headline */}
            <div className="col-span-12 lg:col-span-7">
              <h1 className="text-display-condensed text-[clamp(4.5rem,14vw,12rem)] leading-[0.88] mb-8">
                <span className="rise-in" style={{ animationDelay: '0ms' }}>INNOVATE.</span>
                <span className="rise-in text-outline" style={{ animationDelay: '150ms' }}>BUILD.</span>
                <span className="rise-in" style={{ animationDelay: '300ms', color: 'var(--cyan)' }}>CONTROL.</span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-xl text-[#888] text-base sm:text-lg leading-relaxed mb-8" style={{ animation: 'fade-slide-up 0.5s 0.6s both' }}>
                The operations control plane for IEEE Zerone. Dedicated access for event coordinators and administrators to manage squad allocations, score live submissions, and control event pipelines.
              </p>

              {/* CTA row — Admin & Volunteer focus */}
              <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fade-slide-up 0.6s 0.75s both' }}>
                <button
                  onClick={() => router.push('/volunteer/login')}
                  className="btn-ink btn-swap !px-8 !py-4 text-sm"
                >
                  <span className="swap-a flex items-center gap-2">
                    Volunteer Portal
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span className="swap-b text-[13px] font-mono">AUTHENTICATING…</span>
                </button>

                <button
                  onClick={() => router.push('/admin/login')}
                  className="btn-ghost !px-8 !py-4 flex items-center gap-2 text-sm border-[#7c3aed]/40 hover:border-[#7c3aed] text-white"
                >
                  <Shield className="h-4 w-4 text-[#7c3aed]" />
                  Admin Console
                </button>
              </div>

              {/* Quick-stat strip */}
              <div className="mt-10 flex items-center gap-6 flex-wrap" style={{ animation: 'fade-slide-up 0.5s 0.9s both' }}>
                {[
                  { val: `${totalStudents || 300}+`, label: 'Participants' },
                  { val: '7',    label: 'Stages' },
                  { val: `${totalGroups || 48}`, label: 'Squads' },
                  { val: '4',    label: 'Arenas' },
                ].map(({ val, label }) => (
                  <div key={label} className="flex items-baseline gap-1.5">
                    <span className="text-num text-2xl font-black" style={{ color: 'var(--cyan)' }}>{val}</span>
                    <span className="text-[11px] text-[#555] uppercase tracking-wider font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Telemetry panel */}
            <div className="col-span-12 lg:col-span-5" style={{ animation: 'fade-slide-up 0.7s 0.5s both' }}>
              <div className="panel corner-ticks p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="module-meta justify-between mb-4">
                  <span className="flex items-center gap-2"><span className="led led-green blink" />STATUS · ONLINE</span>
                  <span>NODE_08 · v7.0</span>
                </div>

                {/* Live stat counters */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'REG',   val: totalStudents || 186, color: 'white' },
                    { label: 'CHKD',  val: totalGroups   || 142, color: 'var(--cyan)' },
                    { label: 'TEAMS', val: totalGroups   || 24,  color: 'var(--blue)' },
                    { label: 'LIVE',  val: 4,                    color: 'var(--green)' },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      className="rounded-md border border-[rgba(255,255,255,0.05)] bg-[#0a0a0b] p-3"
                      style={{ animation: `fade-slide-up 0.4s ${0.7 + i * 0.08}s both` }}
                    >
                      <div className="text-mono text-[8px] tracking-[0.14em] text-[#444] mb-1">{s.label}</div>
                      <div className="text-num text-2xl font-bold tabular" style={{ color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Radar + Oscilloscope */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="rounded-md border border-[rgba(255,255,255,0.05)] bg-[#0a0a0b] p-3 aspect-[4/3] relative overflow-hidden">
                    <div className="text-mono text-[8px] tracking-[0.14em] text-[#444]">CAMPUS SCAN</div>
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-3">
                      <circle cx="50" cy="52" r="36" fill="none" stroke="rgba(0,229,255,0.12)" strokeWidth="0.5" />
                      <circle cx="50" cy="52" r="24" fill="none" stroke="rgba(0,229,255,0.12)" strokeWidth="0.5" />
                      <circle cx="50" cy="52" r="12" fill="none" stroke="rgba(0,229,255,0.12)" strokeWidth="0.5" />
                      <line x1="14" y1="52" x2="86" y2="52" stroke="rgba(0,229,255,0.08)" strokeWidth="0.5" />
                      <line x1="50" y1="16" x2="50" y2="88" stroke="rgba(0,229,255,0.08)" strokeWidth="0.5" />
                      <g className="radar-sweep" style={{ transformOrigin: '50px 52px' }}>
                        <path d="M50 52 L50 14 A38 38 0 0 1 76 23 Z" fill="rgba(0,229,255,0.12)" />
                        <line x1="50" y1="52" x2="50" y2="14" stroke="rgba(0,229,255,0.5)" strokeWidth="0.5" />
                      </g>
                      <circle cx="64" cy="40" r="2" fill="#00e5ff" opacity="0.9">
                        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="38" cy="62" r="1.5" fill="#3b82f6" opacity="0.8" />
                      <circle cx="56" cy="68" r="1.5" fill="#7c3aed" opacity="0.7" />
                    </svg>
                  </div>
                  <div className="rounded-md border border-[rgba(255,255,255,0.05)] bg-[#0a0a0b] p-3 aspect-[4/3] relative overflow-hidden">
                    <div className="text-mono text-[8px] tracking-[0.14em] text-[#444]">EVENT PULSE</div>
                    <svg viewBox="0 0 100 50" className="absolute inset-x-0 bottom-2 w-full h-2/3" preserveAspectRatio="none">
                      <path className="osc-wave" d="M0 25 L10 25 L14 8 L20 42 L26 25 L40 25 L46 16 L52 34 L56 25 L72 25 L76 6 L82 44 L88 25 L100 25" fill="none" stroke="#00e5ff" strokeWidth="1.2" />
                    </svg>
                  </div>
                </div>

                {/* Footer meta */}
                <div className="module-meta justify-between">
                  <span>X:203 · Y:442</span>
                  <span>LAT 4ms</span>
                  <span className="signal-glyph text-[10px]" style={{ color: 'var(--green)' }}>█████████░</span>
                  <span>28°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scrolling Ticker ─────────────────────────────── */}
      <div className="relative border-y border-[rgba(255,255,255,0.05)] bg-[#0d0d0e]" style={{ zIndex: 10 }}>
        <div className="overflow-hidden py-3.5">
          <div className="flex gap-12 whitespace-nowrap" style={{ animation: 'ticker-scroll 32s linear infinite', willChange: 'transform' }}>
            {[0, 1].map(rep => (
              <span key={rep} className="flex items-center gap-12 text-mono text-[11px] tracking-[0.15em] uppercase text-[#3a3a3a] shrink-0">
                {['IEEE ZERONE 7.0', 'VOLUNTEER PORTAL', 'ADMIN CONSOLE', '48 SQUADS', '4 ARENAS', '7 STAGES', 'LIVE OPERATIONAL CONTROL PLANE'].map(item => (
                  <span key={item} className="flex items-center gap-12">
                    <span style={{ color: 'var(--cyan)', opacity: 0.6 }}>◆</span>
                    <span className="hover:text-[#a8a8a8] transition-colors">{item}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0d0d0e] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0d0d0e] to-transparent" />
      </div>

      {/* ── Portal Cards Section (Only Volunteer & Admin) ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="mb-12 reveal-hidden" data-delay="0">
          <div className="module-meta mb-4">
            <span className="bib">§01</span>
            <span>ACCESS PORTALS</span>
            <span>·</span>
            <span style={{ color: 'var(--cyan)' }}>2 CONTROL NODES ACTIVE</span>
          </div>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] text-display font-black text-white">
            Choose Your <span className="text-gradient-cyan">Portal.</span>
          </h2>
          <p className="text-sm text-[#555] mt-2 max-w-lg">Select your administrative access node to enter the IEEE Zerone management grid.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Workflow, title: 'Volunteer Portal', nodeId: 'NODE_01', coords: 'X:342 Y:118',
              desc: 'Dedicated portal for event coordinators and volunteers to manage squad nodes, distribute join codes, score milestone submissions in real-time, and broadcast announcements.',
              color: '#00e5ff', label: 'Access Volunteer Portal', route: '/volunteer/login' },
            { icon: Shield, title: 'Admin Console', nodeId: 'NODE_02', coords: 'X:517 Y:308',
              desc: 'Full command and administrative authority over student registries, group capacity, volunteer allocations, stage unlocks, scoring adjustments, and global system parameters.',
              color: '#7c3aed', label: 'Access Admin Console', route: '/admin/login' },
          ].map((card, i) => (
            <div key={card.title} className="reveal-hidden" data-delay={String(i * 100)}>
              <PortalCard
                icon={card.icon} title={card.title} description={card.desc}
                accentColor={card.color} nodeId={card.nodeId} coords={card.coords}
                linkLabel={card.label} onClick={() => router.push(card.route)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Stages Timeline ──────────────────────────────── */}
      <section className="relative z-10 section-hairline bg-[#080809]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="mb-12 reveal-hidden" data-delay="0">
            <div className="module-meta mb-4">
              <span className="bib bib-caution">§02</span>
              <span>INNOVATION PIPELINE</span>
              <span>·</span>
              <span style={{ color: 'var(--orange)' }}>7 STAGES</span>
            </div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] text-display font-black text-white">
              The 7 Stages of <span className="text-gradient-cyan">Zerone.</span>
            </h2>
            <p className="text-sm text-[#555] mt-2 max-w-lg">Every squad navigates these timed competitive rounds managed by volunteers and admins.</p>
          </div>

          <div className="relative">
            <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent hidden md:block" />
            <div className="flex overflow-x-auto gap-4 pb-6 snap-x md:grid md:grid-cols-7 md:overflow-visible">
              {stages.map((stage, i) => {
                const Icon = stage.icon;
                return (
                  <div key={stage.num} className="reveal-hidden relative flex flex-col items-center text-center group snap-center shrink-0 w-32 md:w-auto" data-delay={String(i * 70)}>
                    <div
                      className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border bg-[#111] mb-4 transition-all duration-400 group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
                      style={{ borderColor: `${stage.color}40`, boxShadow: `0 0 0 1px ${stage.color}10` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: stage.color }} />
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: stage.color }}>
                        {stage.num}
                      </span>
                    </div>
                    <h4 className="text-[11px] font-bold text-white leading-tight">{stage.title}</h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider mt-1 font-mono" style={{ color: stage.color }}>{stage.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Terminal & Metrics ──────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mb-10 reveal-hidden" data-delay="0">
          <div className="module-meta mb-4">
            <span className="bib">§03</span>
            <span>LIVE AUDIT STREAM</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="led led-cyan blink" />
              <span style={{ color: 'var(--cyan)' }}>BROADCASTING</span>
            </span>
          </div>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] text-display font-black text-white">
            Operations <span className="text-gradient-cyan">Center.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="panel corner-ticks p-5 space-y-4 reveal-hidden" data-delay="0">
              <h3 className="label-mono flex items-center gap-2 border-b border-[rgba(255,255,255,0.05)] pb-3">
                <Zap className="h-3.5 w-3.5" style={{ color: 'var(--green)' }} />
                SYSTEM TELEMETRY
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'System State',  value: 'ONLINE',           color: 'var(--green)' },
                  { label: 'Capacity Pool', value: '500 ACTIVE',       color: 'var(--green)' },
                  { label: 'Event Mode',    value: 'ACTIVE',           color: 'var(--cyan)'  },
                  { label: 'Sync Engine',   value: 'BroadcastChannel', color: 'var(--cyan)'  },
                  { label: 'Node Status',   value: '8 / 8 HEALTHY',    color: 'var(--blue)'  },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-[#555]">{row.label}</span>
                    <span className="text-num text-[11px] font-bold" style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel corner-ticks p-5 reveal-hidden" data-delay="100">
              <h4 className="label-mono flex items-center gap-2 mb-3">
                <Cpu className="h-3.5 w-3.5" style={{ color: 'var(--green)' }} />
                ARCHITECTURE
              </h4>
              <p className="text-[12px] text-[#555] leading-relaxed">
                Handles up to <span className="font-bold" style={{ color: 'var(--green)' }}>500 concurrent participants</span> via{' '}
                <span className="font-mono font-semibold text-[#888]">BroadcastChannel API</span> with Firebase Cloud persistence and zero-downtime failover.
              </p>
            </div>

            <div className="panel p-4 flex items-center gap-3 reveal-hidden" style={{ borderColor: 'rgba(0,217,146,0.18)', background: 'rgba(0,217,146,0.03)' }} data-delay="200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: 'rgba(0,217,146,0.08)', border: '1px solid rgba(0,217,146,0.18)' }}>
                <Radio className="h-4 w-4 text-[#00d992]" />
              </div>
              <div>
                <div className="text-[11px] font-black text-[#00d992] uppercase tracking-wider">All Channels Clear</div>
                <div className="text-[10px] text-[#555] mt-0.5">Live audit logs stream in real-time</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 reveal-hidden" data-delay="100">
            <Terminal logs={auditLogs} className="h-[300px] sm:h-[420px]" title="zerone_ops / live_audit_stream" />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative z-10 section-hairline bg-[#0a0a0b]">
        <div className="ruler opacity-20 mx-8 mt-0" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5">
              <rect x="4" y="4" width="16" height="16" rx="3" />
              <rect x="9" y="9" width="6" height="6" fill="var(--cyan)" stroke="none" rx="1" />
            </svg>
            <span className="text-xs font-black tracking-widest text-[#3a3a3a] uppercase text-mono">IEEE Zerone · Control Plane v7.0</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold text-[#555] uppercase tracking-wider text-mono">
            <button onClick={() => router.push('/volunteer/login')} className="hover:text-white transition-colors">Volunteer Portal</button>
            <button onClick={() => router.push('/admin/login')}     className="hover:text-white transition-colors">Admin Console</button>
          </div>
          <div className="module-meta text-[#333]">
            <span className="led led-green blink" />
            <span>© 2026 IEEE Zerone · All Channels Encrypted</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
