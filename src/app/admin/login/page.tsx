'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';
import { ShieldAlert, Sparkles, Shield } from 'lucide-react';
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
    <div className="relative min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7c3aed]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#00e5ff]/5 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#222222_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#111] p-8 shadow-2xl z-10"
      >
        <div className="flex flex-col items-center border-b border-[#222] pb-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed] font-black text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] text-lg mb-3">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-[#ffffff] uppercase font-mono">
            ADMIN CONSOLE
          </h1>
          <p className="text-xs text-[#666] mt-1">
            IEEE Zerone 7.0 Command & Management
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-400">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider block mb-1.5 font-mono">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@zerone.org"
              className="w-full rounded-lg bg-[#0a0a0b] border border-[#2a2a2a] px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#7c3aed] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider block mb-1.5 font-mono">
              Operations Secret Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg bg-[#0a0a0b] border border-[#2a2a2a] px-3.5 py-2.5 text-xs text-[#ffffff] placeholder-gray-600 focus:border-[#7c3aed] focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 py-3 text-xs font-bold text-white transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            {isSubmitting ? 'Authenticating...' : 'Enter Admin Console'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
