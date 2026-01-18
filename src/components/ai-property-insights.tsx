'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAIDataInsights } from '@/app/actions';
import { getPropertyWaterReadings, getPropertyMaintenanceRequests } from '@/lib/data';
import type { Property, WaterMeterReading, MaintenanceRequest } from '@/lib/types';
import { Sparkles, AlertTriangle, Lightbulb, TrendingDown, Loader2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLoading } from '@/hooks/useLoading';

interface Props {
    property: Property;
}

export function AIPropertyInsights({ property }: Props) {
    const [insights, setInsights] = useState<any>(null);
    const [isLoadingInternal, setIsLoadingInternal] = useState(false);
    const { startLoading, stopLoading } = useLoading();

    const fetchInsights = async () => {
        setIsLoadingInternal(true);
        startLoading(`Generating AI Insights for ${property.name}...`);
        try {
            const waterReadings = await getPropertyWaterReadings(property.id);
            const maintenanceRequests = await getPropertyMaintenanceRequests(property.id);

            const input = {
                propertyName: property.name,
                waterReadings: waterReadings.map(r => ({
                    unitName: r.unitName,
                    consumption: r.consumption,
                    date: r.date,
                })),
                maintenanceRequests: maintenanceRequests.map(r => ({
                    details: r.details,
                    urgency: r.urgency,
                    status: r.status,
                    date: r.date,
                })),
            };

            const result = await getAIDataInsights(input);
            if (result.success) {
                setInsights(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch AI insights:', error);
        } finally {
            setIsLoadingInternal(false);
            stopLoading();
        }
    };

    if (!insights && !isLoadingInternal) {
        return (
            <Card className="border-dashed bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <CardTitle className="mb-2">Property Intelligence</CardTitle>
                    <CardDescription className="max-w-xs mb-6">
                        Generate AI-powered insights to detect leaks, optimize costs, and improve resident living conditions.
                    </CardDescription>
                    <Button onClick={fetchInsights}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Insights
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isLoadingInternal) {
        return (
            <Card className="animate-pulse">
                <CardHeader>
                    <div className="h-6 w-48 bg-muted rounded mb-2" />
                    <div className="h-4 w-64 bg-muted rounded" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-20 bg-muted rounded" />
                    <div className="h-40 bg-muted rounded" />
                </CardContent>
            </Card>
        )
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardHeader className="border-b bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <CardTitle>AI Property Insights: {property.name}</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchInsights}>
                            Regenerate
                        </Button>
                    </div>
                    <CardDescription>{insights.summary}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Detected Anomalies
                            </h4>
                            <div className="space-y-3">
                                {insights.anomalies.map((anomaly: any, i: number) => (
                                    <div key={i} className={cn("p-4 rounded-xl border transition-all hover:shadow-md", getSeverityColor(anomaly.severity))}>
                                        <div className="flex items-start justify-between mb-1">
                                            <span className="font-bold text-sm tracking-tight">{anomaly.type}</span>
                                            <Badge variant="outline" className="capitalize text-[10px]">{anomaly.severity}</Badge>
                                        </div>
                                        <p className="text-sm opacity-90 leading-snug">{anomaly.description}</p>
                                        {anomaly.affectedUnits?.length > 0 && (
                                            <div className="mt-2 text-[10px] flex gap-1 flex-wrap">
                                                {anomaly.affectedUnits.map((u: string) => (
                                                    <span key={u} className="px-1.5 py-0.5 rounded-md bg-background/50 border border-current">Unit {u}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Management Recommendations
                            </h4>
                            <div className="space-y-3">
                                {insights.recommendations.map((rec: any, i: number) => (
                                    <div key={i} className="p-4 rounded-xl border bg-card/50 hover:bg-card transition-all group">
                                        <h5 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{rec.title}</h5>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{rec.action}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                            <TrendingDown className="h-3 w-3" />
                                            {rec.benefit}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
