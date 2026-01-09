'use client';

import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuth(true);
      } else {
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

  if (!isAuth && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
