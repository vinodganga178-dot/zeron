'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminValuationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard?tab=groups');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center text-[#a8a8a8] font-mono text-xs">
      Redirecting to Group Control Center...
    </div>
  );
}
