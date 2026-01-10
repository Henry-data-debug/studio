
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuth, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything until authentication status is fully loaded
    if (isLoading) {
      return;
    }

    const onLoginPage = pathname === '/login';
    const isTenant = userProfile?.role === 'tenant';

    // If user is authenticated
    if (isAuth) {
      if (onLoginPage) {
        // If on login page, redirect to the correct dashboard
        if (isTenant) {
          router.push('/tenant/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        // If on another page, check if they are on the correct route for their role
        const isTenantRoute = pathname.startsWith('/tenant');
        const isAdminRoute = !isTenantRoute;

        if (isTenant && isAdminRoute) {
          router.push('/tenant/dashboard');
        } else if (!isTenant && isTenantRoute) {
          router.push('/dashboard');
        }
      }
    } 
    // If user is not authenticated
    else {
      if (!onLoginPage) {
        router.push('/login');
      }
    }
  }, [isLoading, isAuth, userProfile, pathname, router]);

  // Show a loader while authentication is in progress or if a necessary redirect hasn't happened yet.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If we are not loading, but the user is not authenticated and not on the login page,
  // we show a loader while redirecting to prevent a flash of content.
  if (!isAuth && pathname !== '/login') {
      return (
        <div className="flex h-screen items-center justify-center">
            <Loader className="h-8 w-8 animate-spin" />
        </div>
      );
  }

  // If the user is authenticated and on the login page, show a loader while redirecting.
  if (isAuth && pathname === '/login') {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  // If none of the above conditions are met, render the children.
  return <>{children}</>;
}
