
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Property } from '@/lib/types';

const parseFloorFromUnitName = (unitName: string): string | null => {
  const match = unitName.match(/(?:\s|-)(\d{1,2})(?:-|\s|$|[A-Z])/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
};

export function useUnitFilter(properties: Property[]) {
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const floors = useMemo(() => {
    if (!selectedProperty) return [];
    const property = properties.find(p => p.id === selectedProperty);
    if (!property) return [];

    const floorSet = new Set<string>();
    property.units.forEach(unit => {
      const floor = parseFloorFromUnitName(unit.name);
      if (floor) {
        floorSet.add(floor);
      }
    });
    
    return Array.from(floorSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [selectedProperty, properties]);

  const unitsOnFloor = useMemo(() => {
    if (!selectedFloor) return [];
    const property = properties.find(p => p.id === selectedProperty);
    if (!property) return [];

    return property.units.filter(unit => {
      const floor = parseFloorFromUnitName(unit.name);
      return floor === selectedFloor;
    });
  }, [selectedFloor, selectedProperty, properties]);

  // Reset floor and unit when property changes
  useEffect(() => {
    setSelectedFloor('');
    setSelectedUnit('');
  }, [selectedProperty]);

  // Reset unit when floor changes
  useEffect(() => {
    setSelectedUnit('');
  }, [selectedFloor]);

  return {
    selectedProperty,
    setSelectedProperty,
    selectedFloor,
    setSelectedFloor,
    selectedUnit,
    setSelectedUnit,
    floors,
    unitsOnFloor,
  };
}
