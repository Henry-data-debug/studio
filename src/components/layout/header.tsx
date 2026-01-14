
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { downloadXLSX } from '@/lib/utils';
import {
  getTenants,
  getLogs,
  getProperties,
  getMaintenanceRequests,
  getLandlords,
  getArchivedTenants
} from '@/lib/data';

const titleMap: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/tenants': 'Tenants',
  '/accounts': 'Accounts',
  '/maintenance': 'Maintenance Requests',
  '/properties': 'Properties',
  '/documents': 'Documents',
  '/clients': 'Client Properties',
  '/landlords': 'Landlords',
  '/airbnb': 'Airbnb Monitoring',
};

export function AppHeader() {
  const pathname = usePathname() || '/';
  // Normalize path by removing trailing slash (except for base /)
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const title = titleMap[normalizedPath] || 'Eracov Properties';

  const handleDownload = async () => {
    let data: any[] = [];
    let filename = 'export.xlsx';

    try {
      if (normalizedPath === '/logs') {
        data = await getLogs();
        filename = 'activity_logs.xlsx';
      }

      if (data.length > 0) {
        // Flatten some objects or clean data if needed
        const cleanedData = data.map(item => {
          const newItem = { ...item };
          // Remove potential complex objects that don't export well
          delete newItem.createdAt;
          return newItem;
        });
        downloadXLSX(cleanedData, filename);
      } else {
        alert('No data available to download for this page.');
      }
    } catch (error) {
      console.error('Failed to download XLSX:', error);
      alert('Error downloading XLSX.');
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {normalizedPath === '/logs' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            title="Download Excel"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Excel
          </Button>
        )}
      </div>
    </header>
  );
}
