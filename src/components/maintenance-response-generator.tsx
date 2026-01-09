'use client';

import { useState } from 'react';
import type { MaintenanceRequest, Tenant, Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader, WandSparkles, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMaintenanceResponseDraft } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  request: MaintenanceRequest;
  tenant: Tenant;
  property: Property;
}

export function MaintenanceResponseGenerator({ request, tenant, property }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<{ draftResponse: string; suggestedActions: string } | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setDraft(null);

    const input = {
      tenantName: tenant.name,
      propertyAddress: property.address,
      requestDetails: request.details,
      urgency: request.urgency,
    };

    const result = await getMaintenanceResponseDraft(input);
    setIsLoading(false);

    if (result.success && result.data) {
      setDraft(result.data);
      toast({ title: 'Draft Generated', description: 'AI has generated a response draft.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };
  
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: `${fieldName} copied to clipboard.` });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Details for the maintenance request from {tenant.name}.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
            <p><strong>Tenant:</strong> {tenant.name}</p>
            <p><strong>Property:</strong> {property.name} ({property.address})</p>
            <p><strong>Urgency:</strong> <span className="capitalize">{request.urgency}</span></p>
            <p><strong>Request:</strong> {request.details}</p>
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <WandSparkles className="mr-2 h-4 w-4" />
          )}
          Generate Draft Response
        </Button>
      </div>

      {draft && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="draft-response">Draft Response to Tenant</Label>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(draft.draftResponse, 'Response')}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <Textarea id="draft-response" value={draft.draftResponse} rows={10} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="suggested-actions">Suggested Internal Actions</Label>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(draft.suggestedActions, 'Actions')}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <Textarea id="suggested-actions" value={draft.suggestedActions} rows={10} readOnly className="bg-muted" />
          </div>
        </div>
      )}
    </div>
  );
}
