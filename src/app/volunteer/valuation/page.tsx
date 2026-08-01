'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VolunteerValuationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/volunteer/dashboard?tab=evaluation');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#94a3b8] font-mono text-xs">
      Redirecting to Evaluation Center...
    </div>
  );
}
