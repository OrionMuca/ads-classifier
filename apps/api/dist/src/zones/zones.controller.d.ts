import { ZonesService } from './zones.service';
export declare class ZonesController {
    private readonly zonesService;
    constructor(zonesService: ZonesService);
    findAll(): Promise<({
        location: {
            id: string;
            city: string;
            country: string;
        };
    } & {
        id: string;
        locationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    })[]>;
    findByLocationId(locationId: string): Promise<{
        id: string;
        locationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }[]>;
    findOne(id: string): Promise<({
        location: {
            id: string;
            city: string;
            country: string;
            createdAt: Date;
            updatedAt: Date;
            state: string | null;
            latitude: number | null;
            longitude: number | null;
            weight: number;
            hasZones: boolean;
        };
    } & {
        id: string;
        locationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }) | null>;
}
