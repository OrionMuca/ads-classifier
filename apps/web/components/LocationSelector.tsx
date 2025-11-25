'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Location, Zone } from '@/types';
import { useZones } from '@/lib/api-hooks';

interface LocationSelectorProps {
    locations: Location[];
    value: string;
    zoneValue?: string;
    onChange: (locationId: string) => void;
    onZoneChange?: (zoneId: string) => void;
    isLoading?: boolean;
}

export function LocationSelector({ 
    locations, 
    value, 
    zoneValue = '', 
    onChange, 
    onZoneChange,
    isLoading 
}: LocationSelectorProps) {
    const selectedLocation = locations.find(loc => loc.id === value);
    const hasZones = selectedLocation?.hasZones || false;
    const previousLocationIdRef = useRef<string>(value);
    const onZoneChangeRef = useRef(onZoneChange);
    
    // Keep ref updated with latest callback (without causing re-renders)
    useEffect(() => {
        onZoneChangeRef.current = onZoneChange;
    }, [onZoneChange]);
    
    const { data: zones = [], isLoading: zonesLoading } = useZones(
        hasZones ? value : undefined
    );

    // Reset zone when location changes
    useEffect(() => {
        // Only reset if location actually changed (not on initial mount)
        const prevLocationId = previousLocationIdRef.current;
        
        if (prevLocationId !== value) {
            previousLocationIdRef.current = value;
            
            // Only call onZoneChange if callback exists and we need to reset
            if (onZoneChangeRef.current) {
                const newLocation = locations.find(loc => loc.id === value);
                const needsReset = !value || !newLocation?.hasZones;
                
                // Only reset if zone needs to be cleared (location cleared or no zones)
                if (needsReset) {
                    onZoneChangeRef.current('');
                }
            }
        }
    }, [value, locations]); // Only depend on value and locations array

    if (isLoading) {
        return (
            <div className="text-sm text-gray-500">Duke ngarkuar...</div>
        );
    }

    return (
        <div className="space-y-4">
            {/* City Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Qyteti *
                </label>
                <select
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="input"
                >
                    <option value="">Zgjidhni qytetin</option>
                    {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                            {loc.city}
                            {loc.hasZones && ' (ka zona)'}
                        </option>
                    ))}
                </select>
            </div>

            {/* Zone Selection (only if city has zones) */}
            {hasZones && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Zona {zones.length > 0 ? '*' : ''}
                    </label>
                    {zonesLoading ? (
                        <div className="text-sm text-gray-500">Duke ngarkuar zonat...</div>
                    ) : zones.length > 0 ? (
                        <>
                            <select
                                required
                                value={zoneValue || ''}
                                onChange={(e) => {
                                    if (onZoneChange) {
                                        onZoneChange(e.target.value);
                                    }
                                }}
                                className={`input ${!zoneValue && zones.length > 0 ? 'border-red-300 dark:border-red-700' : ''}`}
                            >
                                <option value="">Zgjidhni zonën</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name}
                                    </option>
                                ))}
                            </select>
                            {!zoneValue && zones.length > 0 && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    Ju lutem zgjidhni një zonë
                                </p>
                            )}
                            {selectedLocation && zoneValue && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Zona e: {selectedLocation.city}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">Nuk ka zona të disponueshme për këtë qytet</p>
                    )}
                </div>
            )}

            {/* Show selected location info */}
            {value && selectedLocation && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                        Qyteti i zgjedhur:
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        📍 {selectedLocation.city}
                        {zoneValue && zones.find(z => z.id === zoneValue) && (
                            <span className="ml-2">
                                - {zones.find(z => z.id === zoneValue)?.name}
                            </span>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}

