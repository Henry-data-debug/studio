import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AuthWrapper from '@/components/auth-wrapper';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="min-h-[calc(100vh-4rem)] w-full">
              <main className="p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthWrapper>
  );
}
