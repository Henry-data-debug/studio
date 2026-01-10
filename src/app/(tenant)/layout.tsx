
import type { ReactNode } from 'react';
import AuthWrapper from '@/components/auth-wrapper';
import { AppHeader } from '@/components/layout/header';


export default function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper>
      {/* A simple layout for tenants, can be expanded later */}
      <div className="min-h-screen w-full bg-muted/40">
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </AuthWrapper>
  );
}
