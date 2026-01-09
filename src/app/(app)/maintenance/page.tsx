'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getMaintenanceRequests, getTenants, getProperties } from '@/lib/data';
import type { MaintenanceRequest, Tenant, Property } from '@/lib/types';
import { MaintenanceResponseGenerator } from '@/components/maintenance-response-generator';

export default function MaintenancePage() {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [requests, tenantData, propertyData] = await Promise.all([
        getMaintenanceRequests(),
        getTenants(),
        getProperties(),
      ]);
      setMaintenanceRequests(requests);
      setTenants(tenantData);
      setProperties(propertyData);
    }
    fetchData();
  }, []);

  const getTenant = (tenantId: string) => tenants.find((t) => t.id === tenantId);
  const getProperty = (propertyId: string) => properties.find((p) => p.id === propertyId);

  const getStatusVariant = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'New':
        return 'destructive';
      case 'In Progress':
        return 'secondary';
      case 'Completed':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Issue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {maintenanceRequests.map((request) => {
            const tenant = getTenant(request.tenantId);
            const property = getProperty(request.propertyId);
            return (
              <TableRow key={request.id}>
                <TableCell>{request.date}</TableCell>
                <TableCell>{tenant?.name}</TableCell>
                <TableCell>{property?.name}</TableCell>
                <TableCell>{request.details}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {tenant && property && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Draft Response
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Automated Response Draft</DialogTitle>
                        </DialogHeader>
                        <MaintenanceResponseGenerator
                          request={request}
                          tenant={tenant}
                          property={property}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
