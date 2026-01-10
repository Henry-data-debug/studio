
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { getUserProfile } from '@/lib/data';
import { UserProfile } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, userProfile, isAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (isAuth && userProfile) {
        const isTenantRoute = pathname.startsWith('/tenant');
        const isAdminRoute = !isTenantRoute && pathname !== '/login';

        if (userProfile.role === 'admin' || userProfile.role === 'agent' || userProfile.role === 'viewer') {
          if (isTenantRoute) {
            router.push('/dashboard');
          }
        } else if (userProfile.role === 'tenant') {
          if (isAdminRoute) {
            router.push('/tenant/dashboard');
          }
        }
      } else {
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
    }
  }, [isLoading, isAuth, userProfile, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuth && pathname !== '/login') {
    return null;
  }
  
  if (isAuth && pathname === '/login' && userProfile) {
    if (userProfile.role === 'tenant') {
        router.push('/tenant/dashboard');
    } else {
        router.push('/dashboard');
    }
    return null;
  }

  return <>{children}</>;
}
