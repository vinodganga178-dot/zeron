'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VolunteerValuationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/volunteer/dashboard?tab=evaluation');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center text-[#a8a8a8] font-mono text-xs">
      Redirecting to Evaluation Center...
    </div>
  );
}
