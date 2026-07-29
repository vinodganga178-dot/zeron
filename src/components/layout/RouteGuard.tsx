'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useZerone } from '@/context/AppContext';
import { UserRole } from '@/types';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { currentUser, isLoading } = useZerone();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        const primaryRole = allowedRoles[0];
        if (primaryRole === 'volunteer') {
          router.replace('/volunteer/login');
        } else if (primaryRole === 'admin') {
          router.replace('/admin/login');
        } else {
          router.replace('/');
        }
      } else if (!allowedRoles.includes(currentUser.role)) {
        if (currentUser.role === 'volunteer') {
          router.replace('/volunteer/dashboard');
        } else if (currentUser.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/');
        }
      }
    }
  }, [currentUser, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#101010] text-[#ffffff]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00d992] border-t-transparent"></div>
          <p className="text-sm font-semibold tracking-widest text-[#a8a8a8] uppercase">Loading operational data...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
