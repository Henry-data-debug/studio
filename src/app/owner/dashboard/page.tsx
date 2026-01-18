
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Property, Unit, Tenant, Payment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Home, Users, Wallet, DollarSign, Calendar, Droplets, LogOut } from 'lucide-react';
import { getTenants, getTenantPayments } from '@/lib/data';
import { format, addMonths, startOfMonth, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Investor Dashboard Components
interface OwnedUnit extends Unit {
    propertyName: string;
    propertyAddress: string;
    tenantName?: string;
    rent?: number;
    paymentStatus?: 'Paid' | 'Pending' | 'Overdue';
}

function InvestorDashboard() {
    const { userProfile } = useAuth();
    const [ownedUnits, setOwnedUnits] = useState<OwnedUnit[]>([]);
    const [summary, setSummary] = useState({ totalUnits: 0, occupiedUnits: 0, rentCollected: 0 });

    useEffect(() => {
        async function fetchData() {
            if (userProfile?.role === 'homeowner' && userProfile.propertyOwnerDetails) {
                const tenants = await getTenants();
                const ownerDetails = userProfile.propertyOwnerDetails;
                
                let units: OwnedUnit[] = [];
                let rentCollected = 0;
                let occupiedCount = 0;

                ownerDetails.properties.forEach(prop => {
                    prop.units.forEach(unit => {
                        const tenant = tenants.find(t => t.propertyId === prop.property.id && t.unitName === unit.name);
                        const isOccupied = !!tenant;

                        if (isOccupied) {
                            occupiedCount++;
                            if (tenant.lease.paymentStatus === 'Paid') {
                                rentCollected += tenant.lease.rent || 0;
                            }
                        }

                        units.push({
                            ...unit,
                            propertyName: prop.property.name,
                            propertyAddress: prop.property.address,
                            tenantName: tenant?.name,
                            rent: tenant?.lease?.rent,
                            paymentStatus: tenant?.lease?.paymentStatus,
                        });
                    });
                });
                
                setOwnedUnits(units);
                setSummary({
                    totalUnits: units.length,
                    occupiedUnits: occupiedCount,
                    rentCollected: rentCollected,
                });
            }
        }
        fetchData();
    }, [userProfile]);

    const getStatusVariant = (paymentStatus?: string, unitStatus?: string) => {
        if (paymentStatus) {
            switch (paymentStatus) {
                case 'Paid': return 'default';
                case 'Pending': return 'secondary';
                case 'Overdue': return 'destructive';
            }
        }
        if (unitStatus === 'vacant') return 'outline';
        return 'secondary';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Welcome, {userProfile?.name}</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Owned Units</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalUnits}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.occupiedUnits}</div>
                        <p className="text-xs text-muted-foreground">
                            {summary.totalUnits > 0 ? ((summary.occupiedUnits / summary.totalUnits) * 100).toFixed(0) : 0}% occupancy
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Rent Collected (This Period)</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Ksh {summary.rentCollected.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Properties</CardTitle>
                    <CardDescription>A list of all units assigned to you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Property</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Tenant</TableHead>
                                <TableHead>Monthly Rent</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ownedUnits.map((unit, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="font-medium">{unit.propertyName}</div>
                                        <div className="text-xs text-muted-foreground">{unit.propertyAddress}</div>
                                    </TableCell>
                                    <TableCell>{unit.name}</TableCell>
                                    <TableCell>{unit.tenantName || 'N/A'}</TableCell>
                                    <TableCell>{unit.rent ? `Ksh ${unit.rent.toLocaleString()}` : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(unit.paymentStatus, unit.status)}>
                                            {unit.paymentStatus || 'Vacant'}
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

function ResidentOwnerDashboard() {
    const { userProfile } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);

    const tenantDetails = userProfile?.tenantDetails;
    const latestWaterReading = tenantDetails?.waterReadings?.[0];
    
    useEffect(() => {
        if (userProfile?.tenantId) {
            getTenantPayments(userProfile.tenantId).then(setPayments);
        }
    }, [userProfile]);

    const handleMoveOutNotice = () => {
        toast({
            title: "Move-Out Notice Submitted",
            description: "Your one-month notice to vacate has been received and sent to the property manager.",
            duration: 5000,
        });
    };

    const getPaymentStatusVariant = (status?: Tenant['lease']['paymentStatus']) => {
        switch (status) {
            case 'Paid': return 'default';
            case 'Pending': return 'secondary';
            case 'Overdue': return 'destructive';
            default: return 'outline';
        }
    };
    
    const nextDueDate = tenantDetails ? format(startOfMonth(addMonths(new Date(), 1)), 'yyyy-MM-dd') : 'N/A';

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Welcome, {userProfile?.name || 'Homeowner'}</h1>
            <p className="text-muted-foreground">Here is an overview of your resident account.</p>

            {tenantDetails && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Financial Overview</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monthly Service Charge</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Ksh {(tenantDetails.lease.rent || tenantDetails.lease.serviceCharge || 0).toLocaleString()}</div>
                                <Badge variant={getPaymentStatusVariant(tenantDetails.lease.paymentStatus)} className="mt-1">
                                    {tenantDetails.lease.paymentStatus}
                                </Badge>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Water Bill</CardTitle>
                                <Droplets className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {latestWaterReading ? (
                                    <>
                                        <div className="text-2xl font-bold">Ksh {latestWaterReading.amount.toLocaleString()}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Consumption: {latestWaterReading.consumption} units
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-xl font-bold">Not Available</div>
                                        <p className="text-xs text-muted-foreground">No recent reading found.</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{nextDueDate}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>A record of all your service charge and utility payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length > 0 ? (
                                payments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{format(new Date(payment.date), 'PPP')}</TableCell>
                                        <TableCell>Ksh {payment.amount.toLocaleString()}</TableCell>
                                        <TableCell>{payment.type || 'Service Charge'}</TableCell>
                                        <TableCell>{payment.notes}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No payment history found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function OwnerDashboardPage() {
    const { userProfile, isLoading } = useAuth();
    const router = useRouter();
    
    const handleSignOut = async () => {
        await signOut(auth);
        router.push('/login');
    };
    
    if (isLoading) {
        return <div>Loading dashboard...</div>;
    }

    const hasResidentDetails = !!userProfile?.tenantDetails;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    {/* Title can be dynamic if needed, but this is fine for now */}
                </div>
                <Button onClick={handleSignOut} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </header>
            
            {/* Prioritize Resident Dashboard if they are also a resident */}
            {hasResidentDetails ? <ResidentOwnerDashboard /> : <InvestorDashboard />}
        </div>
    );
}
