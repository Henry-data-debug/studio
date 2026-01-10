
'use client';

import { useState, useEffect } from 'react';
import { getTenants, getProperties, archiveTenant } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Edit, Trash } from "lucide-react";
import { Tenant, Property } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        getTenants().then(setTenants);
        getProperties().then(setProperties);
    }, []);

    const handleArchive = async (tenantId: string) => {
        await archiveTenant(tenantId);
        setTenants(tenants.filter(t => t.id !== tenantId));
        toast({
            title: "Tenant Archived",
            description: "The tenant has been moved to the archived list.",
        });
    };

    const getPropertyName = (propertyId: string) => {
        const property = properties.find(p => p.id === propertyId);
        return property ? property.name : 'N/A';
    };

    return (
        <div>
            <div className="flex items-center justify-between w-full mb-6">
                <h2 className="text-2xl font-semibold">Tenants</h2>
                <Button asChild>
                    <Link href="/tenants/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Tenant
                    </Link>
                </Button>
            </div>

            {tenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <h2 className="text-2xl font-semibold">No Tenants Found</h2>
                    <p className="mt-2 text-muted-foreground">
                        Get started by adding your first tenant.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {tenants.map(tenant => (
                        <Card key={tenant.id}>
                            <CardHeader>
                                <CardTitle>{tenant.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Property: {getPropertyName(tenant.propertyId)}</p>
                                <p className="text-sm text-muted-foreground">Unit: {tenant.unitName}</p>
                                <p className="text-sm text-muted-foreground">{tenant.email}</p>
                                <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                                <p className="text-sm text-muted-foreground">ID: {tenant.idNumber}</p>
                                <p className="text-sm text-muted-foreground">Agent: {tenant.agent}</p>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button asChild variant="outline">
                                    <Link href={`/tenants/edit/${tenant.id}`}>
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will archive the tenant and remove them from the active tenants list.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleArchive(tenant.id)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
