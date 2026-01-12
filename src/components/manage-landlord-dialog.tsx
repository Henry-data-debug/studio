
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Landlord, Property, Unit } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  landlord: Landlord;
  property: Property;
  onSave: (landlord: Landlord, selectedUnitNames: string[]) => void;
}

export function ManageLandlordDialog({ isOpen, onClose, landlord, property, onSave }: Props) {
  const [name, setName] = useState(landlord.name);
  const [email, setEmail] = useState(landlord.email);
  const [phone, setPhone] = useState(landlord.phone);
  const [bankAccount, setBankAccount] = useState(landlord.bankAccount);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  
  const landlordUnits = property.units.filter(u => u.ownership === 'Landlord');

  useEffect(() => {
    setName(landlord.name || '');
    setEmail(landlord.email || '');
    setPhone(landlord.phone || '');
    setBankAccount(landlord.bankAccount || '');
    
    // Pre-select units already assigned to this landlord
    const currentlyAssignedUnits = property.units
        .filter(u => u.landlordId === landlord.id)
        .map(u => u.name);
    setSelectedUnits(currentlyAssignedUnits);

  }, [landlord, property]);
  
  const handleUnitToggle = (unitName: string) => {
    setSelectedUnits(prev => 
        prev.includes(unitName) 
            ? prev.filter(name => name !== unitName)
            : [...prev, unitName]
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onSave({
        ...landlord,
        name,
        email,
        phone,
        bankAccount,
    }, selectedUnits);
    setIsLoading(false);
  }

  // Placeholder for earnings calculation
  const earnings = `Calculation pending...`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Landlord for {property.name}</DialogTitle>
          <DialogDescription>
            Edit landlord details, create login credentials, and assign their units.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="landlord-name">Landlord Name</Label>
              <Input id="landlord-name" value={name} onChange={(e) => setName(e.target.value)} required/>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="landlord-email">Landlord Email</Label>
                  <Input id="landlord-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="landlord-phone">Landlord Phone</Label>
                  <Input id="landlord-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required/>
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank-account">Bank Account Details</Label>
              <Input id="bank-account" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
            </div>
             <div className="grid gap-2">
                <Label>Assign Landlord Units</Label>
                <ScrollArea className="h-40 rounded-md border p-4">
                    <div className="space-y-2">
                        {landlordUnits.map(unit => (
                            <div key={unit.name} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`unit-${unit.name}`}
                                    checked={selectedUnits.includes(unit.name)}
                                    onCheckedChange={() => handleUnitToggle(unit.name)}
                                    // Disable checkbox if the unit is assigned to a *different* landlord
                                    disabled={unit.landlordId !== undefined && unit.landlordId !== landlord.id}
                                />
                                <label
                                    htmlFor={`unit-${unit.name}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {unit.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <div className="grid gap-2">
              <Label>Potential Earnings (from occupied units)</Label>
              <p className="text-lg font-semibold">{earnings}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
