'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';

export default function VolunteerRootRedirect() {
  const router = useRouter();
  const { currentUser, isLoading } = useZerone();

  useEffect(() => {
    if (!isLoading) {
      if (currentUser && currentUser.role === 'volunteer') {
        router.replace('/volunteer/dashboard');
      } else {
        router.replace('/volunteer/login');
      }
    }
  }, [currentUser, isLoading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#050505] text-[#ffffff] font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent"></div>
        <p className="text-xs font-semibold tracking-widest text-[#94a3b8] uppercase">Loading Coordinator console...</p>
      </div>
    </div>
  );
}
