
'use client';

import { useEffect, useState } from 'react';
import { getProperties, getLandlords, updateLandlord } from '@/lib/data';
import type { Property, Landlord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Edit } from 'lucide-react';
import { ManageLandlordDialog } from '@/components/manage-landlord-dialog';
import { useToast } from '@/hooks/use-toast';

export default function ClientsPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedLandlord, setSelectedLandlord] = useState<Landlord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
      // In a real app, getProperties would fetch from Firestore.
      // Here, we simulate fetching and then merge landlord data.
      const props = await getProperties();
      const lords = await getLandlords();
      
      // Simulate merging landlord data into properties data from JSON
      const propsWithLandlordIds = props.map(p => {
          const updatedUnits = p.units.map(u => {
              // This is a placeholder logic. A real app would have this link in the DB.
              const owner = lords.find(l => l.id === u.landlordId);
              return owner ? { ...u, landlordId: owner.id } : u;
          });
          return { ...p, units: updatedUnits };
      })

      setAllProperties(propsWithLandlordIds);
      setLandlords(lords);
  }

  useEffect(() => {
    fetchData();
  }, []);
  
  const landlordProperties = allProperties.filter(p => Array.isArray(p.units) && p.units.some(u => u.ownership === 'Landlord'));

  const handleManageClick = (property: Property) => {
    setSelectedProperty(property);
    // This part is tricky. Who are we editing? A new landlord or existing?
    // Let's assume for now we might be creating a new one or picking one.
    // For simplicity, we'll create a new potential landlord ID based on the property.
    const landlordId = `landlord-for-${property.id}-${Date.now()}`;
    const newLandlord: Landlord = { id: landlordId, name: '', email: '', phone: '', bankAccount: '', earnings: 0 };
    
    setSelectedLandlord(newLandlord);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedProperty(null);
    setSelectedLandlord(null);
  }
  
  const handleSaveLandlord = async (landlordData: Landlord, selectedUnitNames: string[]) => {
    if (!selectedProperty) return;
    
    try {
        await updateLandlord(landlordData.id, landlordData, selectedProperty.id, selectedUnitNames);
        toast({ title: 'Landlord Saved', description: `Details for ${landlordData.name} have been saved.` });
        
        // This is a simulation since we can't modify the source JSON
        // In a real Firestore-backed app, this would refetch and show updated state.
        const updatedProperties = allProperties.map(p => {
            if (p.id === selectedProperty.id) {
                const newUnits = p.units.map(u => {
                    if (selectedUnitNames.includes(u.name)) {
                        return { ...u, landlordId: landlordData.id };
                    }
                     // If a unit was previously assigned to this landlord but now is not, unassign it
                    if (u.landlordId === landlordData.id && !selectedUnitNames.includes(u.name)) {
                        const { landlordId, ...rest } = u;
                        return rest;
                    }
                    return u;
                });
                return { ...p, units: newUnits };
            }
            return p;
        });
        setAllProperties(updatedProperties);
        
        // Refresh landlord list
        const lords = await getLandlords();
        setLandlords(lords);

        handleDialogClose();
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to save landlord.' });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Client Properties</h2>
          <p className="text-muted-foreground">Manage properties owned by landlords.</p>
        </div>
      </div>

      {landlordProperties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {landlordProperties.map(property => (
            <Card key={property.id} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{property.name}</CardTitle>
                    <CardDescription>{property.address}</CardDescription>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{property.type}</span>
                  <span className="font-semibold">{Array.isArray(property.units) ? property.units.filter(u => u.ownership === 'Landlord').length : 0} Landlord Units</span>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                  <Button onClick={() => handleManageClick(property)} className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Manage Landlords
                  </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <h3 className="text-xl font-semibold">No Landlord Properties Found</h3>
          <p className="text-muted-foreground mt-2">
            No properties with units marked for 'Landlord' ownership were found.
          </p>
        </div>
      )}
      
      {selectedProperty && selectedLandlord && (
        <ManageLandlordDialog 
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            landlord={selectedLandlord}
            property={selectedProperty}
            onSave={handleSaveLandlord}
        />
      )}
    </div>
  );
}
