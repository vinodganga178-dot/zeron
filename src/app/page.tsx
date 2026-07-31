'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HeaderNavbar from '@/components/layout/HeaderNavbar';
import { useZerone } from '@/context/AppContext';
import {
  ArrowRight,
  ChevronDown,
  X,
  Users,
  Brain,
  Presentation,
  TrendingUp,
  Compass,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Target,
  Sparkles,
  Award,
} from 'lucide-react';

// ── Interactive Information Accordions ───────────────────────────────────────
const infoItems = [
  {
    id: 'info-1',
    title: 'What is ZERONE 7.0?',
    icon: Sparkles,
    content:
      'ZERONE 7.0 is the premier engineering orientation, hackathon, and competitive technical experience organized by IEEE Student Branch CEK specifically for first-year engineering students. It replaces conventional lectures with a dynamic 5-stage operating system where 300+ students collaborate in balanced squads to solve, pitch, sell, and build from day one.',
  },
  {
    id: 'info-2',
    title: 'What is IEEE?',
    icon: BookOpen,
    content:
      'IEEE (Institute of Electrical and Electronics Engineers) is the world’s largest technical professional organization dedicated to advancing technology for humanity. Through student branches worldwide, IEEE provides students with access to cutting-edge technical workshops, international conferences, peer networks, and global career opportunities.',
  },
  {
    id: 'info-3',
    title: 'About IEEE Student Branch Kidangoor',
    icon: Award,
    content:
      'IEEE Student Branch College of Engineering Kidangoor (IEEE SB Kidangoor) is a vibrant, award-winning student-led technical community. We conduct high-impact technical bootcamps, hands-on hackathons, research symposiums, and professional mentorship programs to cultivate future leaders in technology and engineering.',
  },
  {
    id: 'info-4',
    title: 'Event Objectives',
    icon: Target,
    content:
      'ZERONE 7.0 aims to foster rapid teamwork, cross-departmental collaboration, logical problem solving, commercial thinking, and public presentation skills. By connecting first-year students across disciplines, the event establishes strong peer foundations and introduces real-world engineering paradigms.',
  },
  {
    id: 'info-5',
    title: 'Why Participate?',
    icon: ShieldCheck,
    content:
      'Participants experience squad-based problem solving, direct mentorship from senior IEEE student leaders, live leaderboard transparency, hands-on skill building, and recognition across 5 competitive stages. It is the ultimate platform to kickstart your college journey with proof of work.',
  },
  {
    id: 'info-6',
    title: 'Rules & Eligibility',
    icon: CheckCircle2,
    content:
      'Participation is exclusive to first-year engineering students. Squad assignments are deterministically balanced across departments and genders to maximize collaboration. All participants must follow the IEEE Code of Conduct, maintain phone connectivity for live portal interactions, and submit all arena deliverables within specified windows.',
  },
];

// ── 5 Event Stages ────────────────────────────────────────────────────────────
interface StageDetail {
  id: string;
  num: string;
  title: string;
  type: string;
  icon: React.ElementType;
  shortDesc: string;
  overview: string;
  instructions: string[];
  rules: string[];
  requirements: string[];
  notes: string;
}

const eventStages: StageDetail[] = [
  {
    id: 'stage-1',
    num: '01',
    title: 'Registration',
    type: 'Check-in & Onboarding',
    icon: Users,
    shortDesc: 'Digital pass validation, booth check-in, and squad assignment.',
    overview:
      'The initial onboarding stage where every participant validates their identity, receives their digital QR pass, and gets paired with their assigned squad.',
    instructions: [
      'Report to the central registration booth in the main foyer.',
      'Show your registered student QR code to the volunteer desk.',
      'Receive your assigned squad number and meet your teammates at your designated squad table.',
    ],
    rules: [
      'Check-in must be completed prior to the kickoff of Stage 02.',
      'Squad assignments are final and balanced across departments.',
      'Every squad member must maintain their digital pass active on their device.',
    ],
    requirements: [
      'Registered student account on ZERONE 7.0 portal.',
      'College ID card or registration verification.',
      'Smartphone with active web connection.',
    ],
    notes:
      'Keep your digital QR pass accessible at all times; volunteers will scan it at all arena entry points.',
  },
  {
    id: 'stage-2',
    num: '02',
    title: 'Quiz',
    type: 'Logic & Tech Aptitude',
    icon: Brain,
    shortDesc: 'High-speed technical trivia, logic puzzles, and engineering aptitude.',
    overview:
      'A rapid-fire interactive quiz testing logical reasoning, technology trivia, algorithmic thinking, and general engineering knowledge.',
    instructions: [
      'Access the live Quiz portal from your squad dashboard when triggered.',
      'Questions will project in the central auditorium and sync to squad devices.',
      'Collaborate with your squad to submit answers within the countdown timer.',
    ],
    rules: [
      'One submission per squad per question.',
      'No search engine assistance or external reference materials.',
      'Points are calculated based on both correctness and submission velocity.',
    ],
    requirements: [
      'Squad smartphone connected to the ZERONE live network.',
      'Active focus during projected auditorium rounds.',
    ],
    notes:
      'Velocity matters! Fast correct answers score extra tie-breaker points on the master leaderboard.',
  },
  {
    id: 'stage-3',
    num: '03',
    title: 'Pitch the Product',
    type: 'Presentation & Concept',
    icon: Presentation,
    shortDesc: 'Presenting innovative technical solutions, architecture, and impact.',
    overview:
      'Squads formulate a response to a practical engineering problem and present their concept, system architecture, and value proposition to evaluators.',
    instructions: [
      'Review the problem statement assigned to your squad.',
      'Outline your concept, target user, core feature workflow, and technical feasibility.',
      'Present a 3-minute verbal pitch directly to the evaluator panel in Arena A.',
    ],
    rules: [
      'Pitch duration is strictly capped at 3 minutes, followed by 2 minutes of Q&A.',
      'All squad members must participate in the presentation.',
      'Deliverables must adhere to ethical design standards.',
    ],
    requirements: [
      'One-page solution breakdown or slide outline submitted via portal.',
      'Clear representation of technical architecture.',
    ],
    notes:
      'Evaluators look for problem clarity, realistic technical logic, and confident presentation.',
  },
  {
    id: 'stage-4',
    num: '04',
    title: 'Sell the Product',
    type: 'Strategy & Negotiation',
    icon: TrendingUp,
    shortDesc: 'Commercial simulation, market positioning, and buyer persuasion.',
    overview:
      'A strategic roleplay simulation testing your squad’s ability to communicate value, justify adoption, negotiate features, and convince buyer panels.',
    instructions: [
      'Formulate your product’s value proposition, pricing model, and competitive edge.',
      'Engage with designated student buyer panels in Arena B.',
      'Field challenging objections and negotiate adoption commitments.',
    ],
    rules: [
      'Squads are evaluated on market logic, persuasive delivery, and teamwork.',
      'All pricing and adoption projections must be backed by clear reasoning.',
    ],
    requirements: [
      'Executive feature card and market positioning summary.',
      'Designated squad speaker and supporting role distribution.',
    ],
    notes:
      'Focus on clarity and real-world benefit rather than buzzwords.',
  },
  {
    id: 'stage-5',
    num: '05',
    title: 'Treasure Hunt',
    type: 'Campus Exploration',
    icon: Compass,
    shortDesc: 'Campus-wide technical clue decoding and QR checkpoint scanning.',
    overview:
      'An energetic physical and intellectual quest where squads decode technical riddles to discover hidden QR checkpoints across campus.',
    instructions: [
      'Unlock Clue 1 on your squad portal dashboard.',
      'Decipher the riddle to identify the physical location on campus.',
      'Locate the physical QR code and scan it to log your checkpoint time and receive the next clue.',
    ],
    rules: [
      'All squad members must navigate campus together as a unit.',
      'Checkpoints must be scanned in sequential order.',
      'Interfering with physical checkpoint codes is strictly prohibited.',
    ],
    requirements: [
      'Squad phone with camera access enabled.',
      'Active location decoding and teamwork.',
    ],
    notes:
      'The top squads to complete all checkpoints earn maximum speed bonus points on the live standings.',
  },
];

export default function Home() {
  const router = useRouter();
  const { teams, eventControls } = useZerone();

  const totalTeams = Object.keys(teams).length;
  const totalParticipants = Object.values(teams).reduce((acc, t) => acc + t.members.length, 0);
  const liveEventsCount = eventControls.filter((e) => e.status === 'Active').length;

  const [openAccordion, setOpenAccordion] = useState<string | null>('info-1');
  const [selectedStage, setSelectedStage] = useState<StageDetail | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  // IntersectionObserver for Bolt Host Scroll Reveal & Stagger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
          }
        });
      },
      { threshold: 0.12 }
    );

    const revealElements = document.querySelectorAll('.reveal, .stagger');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Custom Cursor Movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Close pop-up modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedStage(null);
      }
    };
    if (selectedStage) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedStage]);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="relative min-h-screen bg-[#101010] text-[#f5f6f7] font-mono selection:bg-[#00d992] selection:text-black overflow-x-hidden">
      {/* Noise Overlay */}
      <div className="noise" />

      {/* Ambient Drifting Mesh Light Blobs */}
      <div className="mesh-blob w-[550px] h-[550px] bg-[#00d992]/15 top-[-10%] left-[-5%]" />
      <div className="mesh-blob w-[650px] h-[650px] bg-[#3d3a39]/20 top-[35%] right-[-10%]" />
      <div className="mesh-blob w-[500px] h-[500px] bg-[#7c3aed]/15 bottom-[-5%] left-[20%]" />

      {/* Custom Cursor Rings */}
      <div
        className="pointer-events-none fixed z-50 h-2 w-2 rounded-full bg-[#00d992] transition-transform duration-75 -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      />
      <div
        className="pointer-events-none fixed z-50 h-8 w-8 rounded-full border border-[#00d992]/40 transition-all duration-150 -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      />

      {/* Background Blueprint SVG Lines */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <g className="blueprint-anim">
            <path
              d="M 100 0 L 100 800 M 0 200 L 1400 200 M 0 500 L 1400 500 M 800 0 L 800 1000"
              stroke="rgba(56, 214, 245, 0.08)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <circle cx="800" cy="200" r="160" stroke="rgba(56, 214, 245, 0.12)" strokeWidth="1" fill="none" strokeDasharray="6 3" />
            <circle cx="800" cy="200" r="4" fill="#00d992" />
            <path
              d="M 100 200 L 300 200 L 400 300 L 700 300"
              stroke="#00d992"
              strokeWidth="1.5"
              fill="none"
              className="draw-stroke"
              opacity="0.5"
            />
            <path
              d="M 800 200 L 950 350 L 1200 350"
              stroke="#7c3aed"
              strokeWidth="1.5"
              fill="none"
              className="draw-stroke"
              opacity="0.4"
            />
            <text x="815" y="195" fill="#00d992" fontSize="10" fontFamily="monospace" opacity="0.6">
              140.00mm
            </text>
            <text x="310" y="195" fill="#8b949e" fontSize="9" fontFamily="monospace">
              + [GRID_X09]
            </text>
          </g>
        </svg>
      </div>

      {/* Header Navigation */}
      <HeaderNavbar />

      {/* ══════════════════════════════════════════════════════
          HERO SECTION (With Bolt Host Glitch & Float Animations)
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[90vh] flex flex-col justify-center">
        {/* Meta Status Row with Floating Motion */}
        <div className="flex items-center justify-between mb-8 text-[11px] font-mono text-[#8b949e] uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d992] pulse-dot" />
            <span className="text-[#00d992] font-bold">ZERONE 7.0</span>
            <span>·</span>
            <span className="text-[#00e5ff] font-bold">CO-POWERED BY IEEE KIDANGOOR</span>
            <span>·</span>
            <span>CONTROL PLANE</span>
            <span>-</span>
            <span className="text-[#00d992] font-bold">ALL SYSTEMS NOMINAL</span>
          </div>
          <div className="hidden sm:block text-[#8b949e]">
            GRID_X09 · 2026
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Headline */}
          <div className="lg:col-span-7">
            <h1 className="text-[clamp(3.5rem,10vw,7.5rem)] font-black leading-[0.92] tracking-tight uppercase mb-8 font-mono select-none">
              <span className="rise-in block text-white" style={{ animationDelay: '0ms' }}>
                INNOVATE.
              </span>
              <span className="rise-in block text-outline" style={{ animationDelay: '150ms' }}>
                BUILD.
              </span>
              <span className="rise-in block text-[#00d992]" style={{ animationDelay: '300ms' }}>
                CONTROL.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#f2f2f2] leading-relaxed max-w-xl mb-10 font-mono">
              The operations control plane for IEEE Zerone. Dedicated access for event coordinators and administrators to manage squad allocations, score live submissions, and control event pipelines.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={() => router.push('/volunteer/login')}
                className="px-6 py-3.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider bg-[#00d992] text-[#101010] hover:bg-[#b8b3b0] transition-all shadow-[0_0_30px_rgba(56,214,245,0.4)] flex items-center gap-2 hover:scale-[1.02]"
              >
                <span>VOLUNTEER LOGIN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/admin/login')}
                className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#1a1a1a] text-white border border-[#3d3a39] hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all hover:scale-[1.02]"
              >
                ADMIN CONSOLE
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-4 pt-6 border-t border-[#3d3a39]/60">
              <div>
                <div className="text-[9px] text-[#8b949e] uppercase font-mono">Participants</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">{totalParticipants > 0 ? totalParticipants : '300+'}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#8b949e] uppercase font-mono">Stages</div>
                <div className="text-xl font-black text-[#00d992] font-mono mt-0.5">{eventControls.length}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#8b949e] uppercase font-mono">Squads</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">{totalTeams}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#8b949e] uppercase font-mono">Arenas</div>
                <div className="text-xl font-black text-[#00d992] font-mono mt-0.5">{liveEventsCount}</div>
              </div>
            </div>
          </div>

          {/* Right Command Panel (With Radar, Oscilloscope & Telemetry) */}
          <div className="lg:col-span-5">
            <div className="gradient-border corner-ticks p-6 rounded-2xl space-y-6 shadow-[0_0_50px_rgba(2,6,19,0.9)] relative">
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-[#3d3a39]/60 pb-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00d992] pulse-dot" />
                  <span className="text-[#f2f2f2] font-bold">STATUS</span>
                  <span>-</span>
                  <span className="text-[#00d992] font-black">ONLINE</span>
                </div>
                <div className="text-[#8b949e] font-bold">NODE_08 · V7.0</div>
              </div>

              {/* 4 Counter Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#3d3a39]">
                  <div className="text-[9px] text-[#8b949e] uppercase font-bold">REG</div>
                  <div className="text-lg font-black text-white mt-1">{totalParticipants > 0 ? totalParticipants : 186}</div>
                </div>
                <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#3d3a39]">
                  <div className="text-[9px] text-[#8b949e] uppercase font-bold">CHKD</div>
                  <div className="text-lg font-black text-[#00d992] mt-1">{totalParticipants > 0 ? totalParticipants : 142}</div>
                </div>
                <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#3d3a39]">
                  <div className="text-[9px] text-[#8b949e] uppercase font-bold">TEAMS</div>
                  <div className="text-lg font-black text-[#3b82f6] mt-1">{totalTeams}</div>
                </div>
                <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#3d3a39]">
                  <div className="text-[9px] text-[#8b949e] uppercase font-bold">LIVE</div>
                  <div className="text-lg font-black text-[#00d992] mt-1">{liveEventsCount}</div>
                </div>
              </div>

              {/* Graphical Widgets: Radar & Oscilloscope */}
              <div className="grid grid-cols-2 gap-4">
                {/* CAMPUS SCAN RADAR WIDGET */}
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#3d3a39] relative overflow-hidden flex flex-col justify-between h-36">
                  <div className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider font-mono">
                    CAMPUS SCAN
                  </div>
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="#3d3a39" strokeWidth="1" fill="none" />
                      <circle cx="50" cy="50" r="30" stroke="#3d3a39" strokeWidth="1" fill="none" />
                      <circle cx="50" cy="50" r="15" stroke="#3d3a39" strokeWidth="1" fill="none" />
                      <line x1="50" y1="5" x2="50" y2="95" stroke="#3d3a39" strokeWidth="1" />
                      <line x1="5" y1="50" x2="95" y2="50" stroke="#3d3a39" strokeWidth="1" />
                      {/* Radar sweep line */}
                      <g className="radar-sweep" style={{ transformOrigin: '50px 50px' }}>
                        <line x1="50" y1="50" x2="50" y2="5" stroke="#00d992" strokeWidth="1.5" />
                        <path d="M 50 50 L 50 5 A 45 45 0 0 1 85 20 Z" fill="rgba(56, 214, 245, 0.15)" />
                      </g>
                      {/* Blinking signal dots */}
                      <circle cx="65" cy="35" r="2.5" fill="#7c3aed" className="pulse-dot" />
                      <circle cx="35" cy="65" r="2.5" fill="#00d992" className="pulse-dot" />
                    </svg>
                  </div>
                </div>

                {/* EVENT PULSE OSCILLOSCOPE WIDGET */}
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#3d3a39] flex flex-col justify-between h-36">
                  <div className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider font-mono">
                    EVENT PULSE
                  </div>
                  <div className="w-full h-20 flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-12" viewBox="0 0 200 60" fill="none">
                      <path
                        d="M 0 30 L 40 30 L 50 10 L 60 50 L 70 20 L 80 40 L 90 30 L 130 30 L 140 5 L 150 55 L 160 30 L 200 30"
                        stroke="#00d992"
                        strokeWidth="2"
                        className="osc-wave"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="pt-2 border-t border-[#3d3a39]/60 flex items-center justify-between text-[10px] font-mono text-[#8b949e]">
                <div>X:203 · Y:442 | LAT 4ms</div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-[#1a1a1a] rounded overflow-hidden">
                    <div className="w-[85%] h-full bg-[#00d992]" />
                  </div>
                  <span className="text-[#00d992] font-bold">28°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker Bar */}
      <div className="w-full bg-[#1a1a1a] border-y border-[#3d3a39]/60 py-3 overflow-hidden">
        <div className="animate-marquee text-[11px] font-mono text-[#8b949e] font-bold uppercase tracking-widest gap-8">
          <span>IEEE ZERONE 7.0</span>
          <span className="text-[#00d992]">◆</span>
          <span>VOLUNTEER PORTAL</span>
          <span className="text-[#7c3aed]">◆</span>
          <span>ADMIN CONSOLE</span>
          <span className="text-[#00d992]">◆</span>
          <span>48 SQUADS</span>
          <span className="text-[#00d992]">◆</span>
          <span>4 ARENAS</span>
          <span className="text-[#7c3aed]">◆</span>
          <span>5 STAGES</span>
          <span className="text-[#00d992]">◆</span>
          <span>LIVE OPERATIONAL CONTROL PLANE</span>
          <span className="text-[#00d992]">◆</span>
          <span>IEEE ZERONE 7.0</span>
          <span className="text-[#7c3aed]">◆</span>
          <span>VOLUNTEER PORTAL</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          INTERACTIVE INFORMATION SECTION (With Scroll Reveal)
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12 reveal">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#00d992] uppercase tracking-wider mb-2">
            <span>§01</span>
            <span>·</span>
            <span>PROGRAM OVERVIEW</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-mono">
            Information <span className="text-gradient">Section.</span>
          </h2>
          <p className="text-sm text-[#f2f2f2] mt-2 max-w-lg font-mono">
            Touch or click any topic below to explore ZERONE 7.0, IEEE, and event guidelines.
          </p>
        </div>

        <div className="space-y-4 max-w-4xl stagger">
          {infoItems.map((item) => {
            const isOpen = openAccordion === item.id;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={`gradient-border overflow-hidden transition-all duration-300 rounded-2xl ${
                  isOpen ? 'glow-cyan border-[#00d992] bg-[#1a1a1a]' : 'hover:border-[#5c5855]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`accordion-body-${item.id}`}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-white font-mono"
                >
                  <span className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#3d3a39] flex items-center justify-center text-[#00d992] shrink-0">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span>{item.title}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8b949e] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#00d992]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`accordion-body-${item.id}`}
                    className="px-6 pb-6 pt-2 text-sm sm:text-base text-[#f2f2f2] leading-relaxed border-t border-[#3d3a39]/60 whitespace-pre-line font-mono"
                  >
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-[#3d3a39] to-transparent" />

      {/* ══════════════════════════════════════════════════════
          5-STAGE ROADMAP WITH INSTRUCTION POP-UPS (With Shimmer & Stagger)
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12 reveal">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#00d992] uppercase tracking-wider mb-2">
            <span>§02</span>
            <span>·</span>
            <span>INNOVATION PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-mono">
            The 5 Stages of <span className="text-gradient">Zerone.</span>
          </h2>
          <p className="text-sm text-[#f2f2f2] mt-2 max-w-lg font-mono">
            Touch or click any stage card below to view its instructions and requirements.
          </p>
        </div>

        {/* 5 Stage Cards Grid with Stagger Entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 stagger">
          {eventStages.map((stage) => {
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStage(stage)}
                className="gradient-border text-left flex flex-col justify-between p-6 cursor-pointer group transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(56,214,245,0.35)] bg-[#1a1a1a] rounded-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-[10px] font-bold text-[#00d992] bg-[#00d992]/10 border border-[#00d992]/30 px-2.5 py-1 rounded-md">
                      STAGE {stage.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#3d3a39] flex items-center justify-center text-white group-hover:border-[#00d992] group-hover:text-[#00d992] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-[#00d992] transition-colors font-mono">
                    {stage.title}
                  </h3>

                  <p className="text-xs text-[#f2f2f2] leading-relaxed line-clamp-3 font-mono">
                    {stage.shortDesc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#3d3a39]/60 flex items-center justify-between text-xs font-semibold text-[#8b949e] group-hover:text-[#00d992] transition-colors font-mono">
                  <span>Instructions</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00d992] group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STAGE INSTRUCTION POP-UP MODAL
      ══════════════════════════════════════════════════════ */}
      {selectedStage && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#101010]/85 backdrop-blur-xl transition-opacity duration-200"
          onClick={() => setSelectedStage(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="w-full sm:max-w-2xl bg-[#1a1a1a] border border-[#3d3a39] rounded-t-[24px] sm:rounded-[24px] p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-[0_0_50px_rgba(2,6,19,0.9)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#3d3a39] pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#00d992]/10 border border-[#00d992]/30 flex items-center justify-center text-[#00d992]">
                  {React.createElement(selectedStage.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#00d992] uppercase tracking-wider">
                    STAGE {selectedStage.num} · {selectedStage.type}
                  </div>
                  <h3 className="text-xl font-black text-white font-mono">
                    {selectedStage.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="p-2 rounded-xl bg-[#1a1a1a] border border-[#3d3a39] text-[#8b949e] hover:text-white hover:border-[#00d992] transition-colors"
                aria-label="Close pop-up"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm text-[#f2f2f2] font-mono">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                  Overview
                </h4>
                <p className="leading-relaxed bg-[#101010] p-4 rounded-xl border border-[#3d3a39]">
                  {selectedStage.overview}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                  Step-by-Step Instructions
                </h4>
                <ul className="space-y-2 list-disc list-inside bg-[#101010] p-4 rounded-xl border border-[#3d3a39]">
                  {selectedStage.instructions.map((inst, i) => (
                    <li key={i} className="leading-relaxed">
                      {inst}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                    Rules & Criteria
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside bg-[#101010] p-4 rounded-xl border border-[#3d3a39] text-xs">
                    {selectedStage.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
                    Requirements
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside bg-[#101010] p-4 rounded-xl border border-[#3d3a39] text-xs">
                    {selectedStage.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#00d992]/10 border border-[#00d992]/30 text-xs text-[#00d992] font-mono">
                <span className="font-bold">IMPORTANT NOTE: </span>
                {selectedStage.notes}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#3d3a39] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStage(null)}
                className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#1a1a1a] text-white border border-[#3d3a39] hover:border-[#00d992] hover:text-[#00d992] transition-all"
              >
                Close Pop-up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hairline Divider */}
      <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-[#3d3a39] to-transparent" />

      {/* ══════════════════════════════════════════════════════
          FOOTER WITH CONTACT OPTION ON THE RIGHT
      ══════════════════════════════════════════════════════ */}
      <footer className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-[#f2f2f2]">
          {/* Left Side: ZERONE 7.0 Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1a1a1a] border border-[#3d3a39] flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-[#00d992] pulse-dot" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                ZERONE <span className="text-[#00d992]">7.0</span>
              </span>
            </div>

            <p className="text-xs leading-relaxed max-w-md text-[#8b949e]">
              The central engineering control plane and orientation platform operated by IEEE Student Branch College of Engineering Kidangoor.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#3d3a39] text-[#00d992] text-xs font-mono font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-[#00d992] pulse-dot" />
              <span>SYSTEM ONLINE · ALL CHANNELS ENCRYPTED</span>
            </div>
          </div>

          {/* Right Side: Contact Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Contact & Support
            </h3>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#00d992] shrink-0" />
                <a
                  href="mailto:ieee@cekg.ac.in"
                  className="hover:text-[#00d992] transition-colors"
                >
                  ieee@cekg.ac.in
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#00d992] shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="hover:text-[#00d992] transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>

              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#00d992] shrink-0 mt-0.5" />
                <span>
                  IEEE Student Branch Kidangoor, College of Engineering Kidangoor,
                  Kottayam, Kerala 686572, India
                </span>
              </li>
            </ul>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#8b949e]">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00d992] transition-colors flex items-center gap-1"
              >
                LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00d992] transition-colors flex items-center gap-1"
              >
                Instagram <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00d992] transition-colors flex items-center gap-1"
              >
                GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#3d3a39]/60 text-center sm:text-left text-xs font-mono text-[#8b949e]">
          © 2026 IEEE Student Branch CEK. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
