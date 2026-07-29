'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';

export default function AdminRootRedirect() {
  const router = useRouter();
  const { currentUser, isLoading } = useZerone();

  useEffect(() => {
    if (!isLoading) {
      if (currentUser && currentUser.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/admin/login');
      }
    }
  }, [currentUser, isLoading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#101010] text-[#ffffff]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00d992] border-t-transparent"></div>
        <p className="text-sm font-semibold tracking-widest text-[#a8a8a8] uppercase">Loading Command console...</p>
      </div>
    </div>
  );
}
