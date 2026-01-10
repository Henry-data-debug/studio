
'use client';

import { useEffect, useState } from 'react';
import { getTenants, getProperties } from '@/lib/data';
import type { Tenant, Property } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Percent, Users, UserX } from 'lucide-react';

export default function AccountsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    getTenants().then(setTenants);
    getProperties().then(setProperties);
  }, []);

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property ? property.name : 'N/A';
  };

  const getPaymentStatusVariant = (status: Tenant['lease']['paymentStatus']) => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const financialSummary = tenants.reduce(
    (acc, tenant) => {
      const rent = tenant.lease.rent || 0;
      if (tenant.lease.paymentStatus === 'Paid') {
        acc.collected += rent;
      } else if (tenant.lease.paymentStatus === 'Pending') {
        acc.pending += rent;
      } else if (tenant.lease.paymentStatus === 'Overdue') {
        acc.overdue += rent;
      }
      return acc;
    },
    { collected: 0, pending: 0, overdue: 0 }
  );

  const totalUnits = properties.reduce((sum, p) => sum + (Array.isArray(p.units) ? p.units.length : 0), 0);
  const occupiedUnits = tenants.length;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
  
  const stats = [
    { title: "Rent Collected", value: `$${financialSummary.collected.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
    { title: "Rent Pending", value: `$${financialSummary.pending.toLocaleString()}`, icon: Users, color: "text-yellow-500" },
    { title: "Rent Overdue", value: `$${financialSummary.overdue.toLocaleString()}`, icon: UserX, color: "text-red-500" },
    { title: "Occupancy Rate", value: `${occupancyRate.toFixed(1)}%`, icon: Percent, color: "text-blue-500" },
  ];

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Accounts Dashboard</h2>
        <p className="text-muted-foreground">A financial overview of your properties.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
                </Card>
            ))}
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Financial Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Lease End</TableHead>
                <TableHead>Rent Amount</TableHead>
                <TableHead className="text-right">Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="font-medium">{tenant.name}</div>
                    <div className="text-sm text-muted-foreground">{tenant.email}</div>
                  </TableCell>
                  <TableCell>
                    <div>{getPropertyName(tenant.propertyId)}</div>
                    <div className="text-sm text-muted-foreground">Unit: {tenant.unitName}</div>
                  </TableCell>
                  <TableCell>{tenant.lease.endDate}</TableCell>
                  <TableCell>${tenant.lease.rent.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getPaymentStatusVariant(tenant.lease.paymentStatus)}>
                      {tenant.lease.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
