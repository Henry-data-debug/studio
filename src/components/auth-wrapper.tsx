
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { getUserProfile } from '@/lib/data';
import { UserProfile } from '@/lib/types';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);

        if (profile) {
          const isTenantRoute = pathname.startsWith('/tenant');
          const isAdminRoute = !isTenantRoute && pathname !== '/login';

          if (profile.role === 'admin' || profile.role === 'agent' || profile.role === 'viewer') {
            if (isTenantRoute) {
              router.push('/dashboard');
            }
          } else if (profile.role === 'tenant') {
            if (isAdminRoute) {
              router.push('/tenant/dashboard');
            }
          }
        } else {
           if (pathname !== '/login') {
             router.push('/login');
           }
        }
      } else {
        setUserProfile(null);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isAuth = !!userProfile;

  if (!isAuth && pathname !== '/login') {
    return null;
  }
  
  if(isAuth && pathname === '/login') {
    if (userProfile.role === 'tenant') {
        router.push('/tenant/dashboard');
    } else {
        router.push('/dashboard');
    }
    return null;
  }

  return <>{children}</>;
}
