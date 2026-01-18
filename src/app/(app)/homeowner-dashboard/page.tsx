
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Droplets, CreditCard, History, Loader2 } from 'lucide-react';
import { getTenantPayments, getTenant, getLandlordPropertiesAndUnits, getTenants, getProperty, getProperties } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Payment, Tenant, WaterMeterReading, Property, Unit } from '@/lib/types';
import { LandlordDashboardContent } from '@/components/financials/landlord-dashboard-content';
import { aggregateFinancials, FinancialSummary } from '@/lib/financial-utils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function HomeownerDashboard() {
    const { userProfile, isLoading: authLoading } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [residentDetails, setResidentDetails] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Landlord Data
    const [landlordProperties, setLandlordProperties] = useState<{ property: Property, units: Unit[] }[]>([]);
    const [landlordTenants, setLandlordTenants] = useState<Tenant[]>([]);
    const [landlordFinancials, setLandlordFinancials] = useState<FinancialSummary | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (userProfile?.role === 'landlord') {
                try {
                    // Fetch properties owned by landlord (using their User ID or linked Landlord ID)
                    // We assume userProfile.id is the link, or userProfile.landlordId
                    const landlordId = userProfile.landlordId || userProfile.id; // Fallback

                    const props = await getLandlordPropertiesAndUnits(landlordId);
                    setLandlordProperties(props);

                    // Flatten units to get all unit names/property relations
                    // Then find tenants in those units
                    const allTenants = await getTenants();
                    const relevantTenants: Tenant[] = [];

                    props.forEach(p => {
                        p.units.forEach(u => {
                            // Find tenant in this property & unit
                            const t = allTenants.find(at => at.propertyId === p.property.id && at.unitName === u.name && at.status === 'active');
                            if (t) relevantTenants.push(t);
                        });
                    });

                    setLandlordTenants(relevantTenants);

                    // Fetch payments for these tenants
                    // In a real app we would query database. Here we can iterate.
                    // Since we don't have a "getAllPayments" exposed efficiently, we might need to fetch by tenant.
                    // But we have getTenantPayments(tenantId).

                    let allPayments: Payment[] = [];
                    for (const t of relevantTenants) {
                        const p = await getTenantPayments(t.id);
                        allPayments = [...allPayments, ...p];
                    }

                    // Sort payments
                    allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setPayments(allPayments);

                    const summary = aggregateFinancials(allPayments, relevantTenants);
                    setLandlordFinancials(summary);

                } catch (e) {
                    console.error("Error fetching landlord data", e);
                } finally {
                    setIsLoading(false);
                }
            } else if (userProfile?.tenantId) {
                try {
                    const [paymentData, details] = await Promise.all([
                        getTenantPayments(userProfile.tenantId),
                        getTenant(userProfile.tenantId)
                    ]);
                    setPayments(paymentData);
                    setResidentDetails(details);
                } catch (error) {
                    console.error("Failed to fetch homeowner data:", error);
                } finally {
                    setIsLoading(false);
                }
            } else if (!authLoading) {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [userProfile, authLoading]);

    if (authLoading || isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (userProfile?.role === 'landlord' && landlordFinancials) {
        return (
            <LandlordDashboardContent
                properties={landlordProperties}
                tenants={landlordTenants}
                payments={payments}
                financialSummary={landlordFinancials}
            />
        );
    }

    if (!residentDetails && userProfile?.role !== 'landlord') {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 bg-muted rounded-full">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">Resident Profile Not Found</h2>
                <p className="text-muted-foreground max-w-sm">We couldn't link your account to a property. Please contact management to verify your resident status.</p>
            </div>
        );
    }

    // Fallback if data is missing but role is 'landlord' (should have been handled by isLoading, but safety check)
    if (!residentDetails) return null;

    const getStatusVariant = (status?: string) => {
        switch (status) {
            case 'Paid': return 'default';
            case 'Pending': return 'secondary';
            case 'Overdue': return 'destructive';
            default: return 'outline';
        }
    };

    const serviceCharge = residentDetails.lease.serviceCharge || residentDetails.lease.rent;
    const latestWaterReading = residentDetails.waterReadings?.[0];

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Resident Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {residentDetails.name}. Here is your account overview.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Unit Info Card */}
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">My Property</CardTitle>
                        <Building2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{residentDetails.unitName}</div>
                        <p className="text-xs text-muted-foreground mt-1">Property ID: {residentDetails.propertyId}</p>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                    </CardContent>
                </Card>

                {/* Billing Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Service Charge</CardTitle>
                        <CreditCard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Ksh {serviceCharge.toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getStatusVariant(residentDetails.lease.paymentStatus)}>
                                {residentDetails.lease.paymentStatus}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Due for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Water Reading Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Water Consumption</CardTitle>
                        <Droplets className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        {latestWaterReading ? (
                            <>
                                <div className="text-2xl font-bold">Ksh {latestWaterReading.amount.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Using {latestWaterReading.consumption} units (Current: {latestWaterReading.currentReading})
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No recent water readings available.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Payment History */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Payments</CardTitle>
                            <CardDescription>Your last 5 successful transactions.</CardDescription>
                        </div>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.slice(0, 5).map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-semibold">Ksh {payment.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-muted-foreground truncate max-w-[150px]">{payment.notes || '-'}</TableCell>
                                    </TableRow>
                                ))}
                                {payments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                            No payment records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Water History */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Water Usage Details</CardTitle>
                            <CardDescription>Breakdown of your recent meter readings.</CardDescription>
                        </div>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead>Reading</TableHead>
                                    <TableHead>Consumption</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {residentDetails.waterReadings?.map((reading) => (
                                    <TableRow key={reading.id}>
                                        <TableCell className="font-medium">{new Date(reading.date).toLocaleString('default', { month: 'short', year: 'numeric' })}</TableCell>
                                        <TableCell>{reading.currentReading}</TableCell>
                                        <TableCell>{reading.consumption} units</TableCell>
                                        <TableCell className="text-right font-semibold">Ksh {reading.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                {(!residentDetails.waterReadings || residentDetails.waterReadings.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                            No water readings found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
