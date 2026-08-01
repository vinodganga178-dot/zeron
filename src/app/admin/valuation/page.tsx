'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminValuationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard?tab=groups');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#94a3b8] font-mono text-xs">
      Redirecting to Group Control Center...
    </div>
  );
}
