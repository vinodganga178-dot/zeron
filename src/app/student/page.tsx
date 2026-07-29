'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/volunteer/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-xs font-mono text-[#888]">
      Redirecting to ZERONE 7.0 Volunteer Portal...
    </div>
  );
}
