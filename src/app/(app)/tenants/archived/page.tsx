
'use client';

import { useState, useEffect } from 'react';
import { getArchivedTenants, getProperties } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArchivedTenant, Property } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ArchivedTenantsPage() {
    const [tenants, setTenants] = useState<ArchivedTenant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        getArchivedTenants().then(setTenants);
        getProperties().then(setProperties);
    }, []);

    const getPropertyName = (propertyId: string) => {
        const property = properties.find(p => p.id === propertyId);
        return property ? property.name : 'N/A';
    };

    return (
        <div>
            <div className="flex items-center justify-between w-full mb-6">
                <h2 className="text-2xl font-semibold">Archived Tenants</h2>
            </div>

            {tenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <h2 className="text-2xl font-semibold">No Archived Tenants Found</h2>
                    <p className="mt-2 text-muted-foreground">
                        When tenants are archived, they will appear here.
                    </p>
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Archived At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenants.map(tenant => (
                                    <TableRow key={tenant.id}>
                                        <TableCell>{tenant.name}</TableCell>
                                        <TableCell>{getPropertyName(tenant.propertyId)}</TableCell>
                                        <TableCell>{tenant.unitName}</TableCell>
                                        <TableCell>{tenant.email}</TableCell>
                                        <TableCell>{tenant.phone}</TableCell>
                                        <TableCell>{new Date(tenant.archivedAt).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
