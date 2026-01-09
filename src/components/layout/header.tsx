'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { FilePlus2 } from 'lucide-react';

const titleMap: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/tenants': 'Tenants',
  '/leases': 'Lease Tracking',
  '/maintenance': 'Maintenance Requests',
  '/properties': 'Properties',
  '/documents': 'Documents',
  '/clients': 'Client Properties',
  '/airbnb': 'Airbnb Monitoring',
};

export function AppHeader() {
  const pathname = usePathname();
  const title = titleMap[pathname] || 'Eracov Properties';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
       <div className="flex items-center gap-4">
        {/* Example action button */}
        <Button size="sm">
            <FilePlus2 className="mr-2 h-4 w-4" />
            Add New
        </Button>
      </div>
    </header>
  );
}
