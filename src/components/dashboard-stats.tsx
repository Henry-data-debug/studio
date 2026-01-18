
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, Building2, Wrench, AlertCircle, Building } from "lucide-react";
import { getTenants, getProperties, getMaintenanceRequests, getAllPayments } from "@/lib/data";
import { useEffect, useState } from "react";
import { Tenant, Property, MaintenanceRequest, Payment } from "@/lib/types";
import { calculateTransactionBreakdown } from "@/lib/financial-utils";

export function DashboardStats() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    getTenants().then(setTenants);
    getProperties().then(setProperties);
    getMaintenanceRequests().then(setMaintenanceRequests);
    getAllPayments().then(setPayments);
  }, []);

  const totalTenants = tenants.length;
  const totalProperties = properties.length;
  const pendingMaintenance = maintenanceRequests.filter(r => r.status !== 'Completed').length;
  const overdueRents = tenants.filter(t => t.lease && t.lease.paymentStatus === 'Overdue').length;

  const occupiedUnits = (() => {
    const occupiedUnitIdentifiers = new Set<string>();

    // Add units that have a tenant
    tenants.forEach(tenant => {
      occupiedUnitIdentifiers.add(`${tenant.propertyId}-${tenant.unitName}`);
    });

    // Add units that are marked as occupied by their status (e.g., airbnb, client occupied)
    properties.forEach(property => {
      if (Array.isArray(property.units)) {
        property.units.forEach(unit => {
          if (unit.status !== 'vacant') {
            occupiedUnitIdentifiers.add(`${property.id}-${unit.name}`);
          }
        });
      }
    });

    return occupiedUnitIdentifiers.size;
  })();

  const totalMgmtFees = payments.reduce((sum, p) => {
    if (p.type === 'Deposit') return sum;
    const t = tenants.find(tenant => tenant.id === p.tenantId);
    const serviceCharge = t?.lease?.serviceCharge || 0;
    const breakdown = calculateTransactionBreakdown(p.amount, serviceCharge);
    return sum + breakdown.managementFee;
  }, 0);

  const stats = [
    { title: "Total Tenants", value: totalTenants, icon: Users, color: "text-blue-500" },
    { title: "Properties Managed", value: totalProperties, icon: Building2, color: "text-green-500" },
    { title: "Occupied Units", value: occupiedUnits, icon: Building, color: "text-purple-500" },
    { title: "Agency Revenue", value: `Ksh ${totalMgmtFees.toLocaleString()}`, icon: Building2, color: "text-emerald-500" },
    { title: "Pending Maintenance", value: pendingMaintenance, icon: Wrench, color: "text-yellow-500" },
    { title: "Overdue Rents", value: overdueRents, icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
            <p className="text-xs text-muted-foreground">
              {/* Additional context if needed */}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
