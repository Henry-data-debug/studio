
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProperties, addTenant } from '@/lib/data';
import { agents } from '@/lib/types';
import type { Property, Unit, Agent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AddTenantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [vacantUnits, setVacantUnits] = useState<Unit[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [unitName, setUnitName] = useState('');
  const [agent, setAgent] = useState<Agent>();

  useEffect(() => {
    async function fetchProperties() {
      const props = await getProperties();
      setProperties(props);
    }
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      const property = properties.find(p => p.id === selectedProperty);
      if (property) {
        setVacantUnits(property.units.filter(u => u.status === 'vacant'));
      }
    } else {
      setVacantUnits([]);
    }
    setUnitName('');
  }, [selectedProperty, properties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !unitName || !agent) return;

    try {
      await addTenant({
        name,
        email,
        phone,
        idNumber,
        propertyId: selectedProperty,
        unitName,
        agent,
      });
      toast({
        title: "Tenant Added",
        description: `${name} has been added as a new tenant.`,
      });
      router.push('/tenants');
    } catch (error) {
      console.error('Error adding tenant:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add tenant. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Tenant</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="idNumber">ID Number</Label>
                <Input id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="property">Property</Label>
                <Select onValueChange={setSelectedProperty} value={selectedProperty}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                        {properties.map(property => (
                            <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="unit">Unit</Label>
                <Select onValueChange={setUnitName} value={unitName} disabled={!selectedProperty}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {vacantUnits.filter(unit => unit.name !== '').map((unit, index) => (
                            <SelectItem key={`${unit.name}-${index}`} value={unit.name}>{unit.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="agent">Agent</Label>
            <Select onValueChange={(value) => setAgent(value as Agent)} value={agent}>
                <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                    {agents.map(agent => (
                        <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={!selectedProperty || !unitName || !agent}>Add Tenant</Button>
        </form>
      </CardContent>
    </Card>
  );
}
