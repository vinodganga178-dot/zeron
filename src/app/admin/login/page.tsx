'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderNavbar from '@/components/layout/HeaderNavbar';
import { useZerone } from '@/context/AppContext';
import { ShieldAlert, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const router = useRouter();
  const { loginAdmin, currentUser, isLoading } = useZerone();

  const [email, setEmail] = useState('admin@zerone.org');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role === 'admin') router.push('/admin/dashboard');
      else if (currentUser.role === 'volunteer') router.push('/volunteer/dashboard');
    }
  }, [currentUser, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      await loginAdmin(email, password);
      setSuccessMsg(`Welcome root administrator! Opening operational console...`);
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 800);
    } catch (e) {
      const error = e as Error;
      setErrorMsg(error.message || "Invalid administrative credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#101010] text-[#f5f6f7] font-mono selection:bg-[#7c3aed] selection:text-white flex items-center justify-center p-4 pt-28 overflow-x-hidden">
      {/* Noise Overlay */}
      <div className="noise" />

      {/* Ambient Drifting Mesh Blobs */}
      <div className="mesh-blob w-[550px] h-[550px] bg-[#7c3aed]/20 top-[-10%] left-[-5%]" />
      <div className="mesh-blob w-[650px] h-[650px] bg-[#3d3a39]/20 top-[35%] right-[-10%]" />
      <div className="mesh-blob w-[500px] h-[500px] bg-[#00d992]/15 bottom-[-5%] left-[20%]" />

      <HeaderNavbar />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md rounded-2xl border border-[#3d3a39] bg-[#1a1a1a] p-8 shadow-[0_0_50px_rgba(2,6,19,0.9)] gradient-border corner-ticks z-10"
      >
        <div className="flex flex-col items-center border-b border-[#3d3a39]/60 pb-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed] font-black text-white shadow-[0_0_30px_rgba(124,58,237,0.5)] text-lg mb-3">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-white uppercase font-mono">
            ADMIN CONSOLE
          </h1>
          <p className="text-xs text-[#00d992] mt-1 font-mono font-bold uppercase tracking-wider">
            ZERONE 7.0 · CO-POWERED BY IEEE KIDANGOOR
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 font-mono">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#00d992]/10 border border-[#00d992]/30 p-3 text-xs text-[#00d992] font-mono">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 font-mono text-xs">
          <div>
            <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-1.5 font-mono">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@zerone.org"
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#3d3a39] px-4 py-3 text-white placeholder-gray-500 focus:border-[#7c3aed] outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block mb-1.5 font-mono">
              Operations Secret Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#3d3a39] px-4 py-3 text-white placeholder-gray-500 focus:border-[#7c3aed] outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white disabled:opacity-50 py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Enter Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
