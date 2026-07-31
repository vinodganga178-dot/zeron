'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HeaderNavbar from '@/components/layout/HeaderNavbar';
import { useZerone } from '@/context/AppContext';
import { Key, Mail, User, Phone as PhoneIcon, ArrowRight, ShieldAlert, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginVolunteer, loginAdmin, registerVolunteer } = useZerone();

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'signin';
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'register') setMode('register');
    else if (m === 'signin') setMode('signin');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        let user;
        try {
          user = await loginVolunteer(email.trim(), password);
        } catch {
          user = await loginAdmin(email.trim(), password);
        }

        if (user) {
          setSuccessMsg('Authentication successful! Redirecting...');
          setTimeout(() => {
            if (user.role === 'admin') router.push('/admin/dashboard');
            else if (user.role === 'volunteer') router.push('/volunteer/dashboard');
            else router.push('/');
          }, 800);
        } else {
          throw new Error('Invalid email or password.');
        }
      } else {
        const user = await registerVolunteer(
          name.trim(),
          email.trim(),
          phone.trim() || '9999999999',
          department,
          password
        );
        if (user) {
          setSuccessMsg('Account created successfully! Redirecting to sign in...');
          setTimeout(() => {
            setMode('signin');
            setSuccessMsg('');
          }, 1200);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#101010] text-[#f5f6f7] font-mono selection:bg-[#00d992] selection:text-black flex flex-col justify-center py-24 overflow-x-hidden">
      {/* Noise Overlay */}
      <div className="noise" />

      {/* Ambient Drifting Mesh Light Blobs */}
      <div className="mesh-blob w-[550px] h-[550px] bg-[#00d992]/15 top-[-10%] left-[-5%]" />
      <div className="mesh-blob w-[650px] h-[650px] bg-[#3d3a39]/20 top-[35%] right-[-10%]" />
      <div className="mesh-blob w-[500px] h-[500px] bg-[#7c3aed]/15 bottom-[-5%] left-[20%]" />

      <HeaderNavbar />

      <main className="relative z-10 px-4 max-w-md w-full mx-auto">
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-7 sm:p-8 shadow-[0_0_50px_rgba(2,6,19,0.9)] overflow-hidden relative gradient-border corner-ticks"
        >
          {/* Accent Line Header */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00e5ff] via-[#00d992] to-[#7c3aed]" />

          <div className="text-center mb-6 pt-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] mx-auto mb-3">
              {mode === 'signin' ? (
                <LogIn className="h-6 w-6" />
              ) : (
                <UserPlus className="h-6 w-6" />
              )}
            </div>
            <h1 className="text-xl font-black tracking-wider text-white uppercase font-mono">
              {mode === 'signin' ? 'Sign In to ZERONE 7.0' : 'Create Account'}
            </h1>
            <p className="text-xs text-[#777] mt-1 font-mono">
              {mode === 'signin'
                ? 'Enter your credentials to access your control plane dashboard.'
                : 'Fill in your details to register for ZERONE 7.0.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-[#0a0a0b] p-1.5 rounded-xl mb-6 border border-[#2a2a2a] text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`py-2.5 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-[#00e5ff] text-[#0a0a0b] shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-2.5 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#00d992] text-[#0a0a0b] shadow-[0_0_15px_rgba(0,217,146,0.25)]'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-xs text-red-400 font-mono">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#00d992]/10 border border-[#00d992]/25 p-3 text-xs text-[#00d992] font-mono">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-[#888] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#555] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl bg-[#0a0a0b] border border-[#2a2a2a] pl-9 pr-3.5 py-2.5 text-white placeholder-gray-600 focus:border-[#00e5ff] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-[#888] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#555] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-xl bg-[#0a0a0b] border border-[#2a2a2a] pl-9 pr-3.5 py-2.5 text-white placeholder-gray-600 focus:border-[#00e5ff] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#888] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#555] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[#0a0a0b] border border-[#2a2a2a] pl-9 pr-3.5 py-2.5 text-white placeholder-gray-600 focus:border-[#00e5ff] outline-none transition-all"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-[#888] uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="w-4 h-4 text-[#555] absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl bg-[#0a0a0b] border border-[#2a2a2a] pl-9 pr-3.5 py-2.5 text-white placeholder-gray-600 focus:border-[#00e5ff] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#888] uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl bg-[#0a0a0b] border border-[#2a2a2a] px-3.5 py-2.5 text-white focus:border-[#00e5ff] outline-none transition-all"
                  >
                    <option value="Computer Science">Computer Science & Eng</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Information Tech">Information Technology</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-4 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === 'signin'
                  ? 'bg-[#00e5ff] text-[#0a0a0b] hover:bg-[#2fd6a1] shadow-[0_0_20px_rgba(0,229,255,0.25)]'
                  : 'bg-[#00d992] text-[#0a0a0b] hover:bg-[#2fd6a1] shadow-[0_0_20px_rgba(0,217,146,0.25)]'
              }`}
            >
              {loading ? (
                'PROCESSING…'
              ) : mode === 'signin' ? (
                <>
                  SIGN IN
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  REGISTER
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#101010] text-[#00e5ff] font-mono flex items-center justify-center text-xs">
          Loading authentication...
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
