import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    findAll(): Promise<{
        id: string;
        city: string;
        country: string;
        _count: {
            posts: number;
        };
        latitude: number | null;
        longitude: number | null;
        weight: number;
    }[]>;
    findOne(id: string): Promise<({
        _count: {
            posts: number;
        };
    } & {
        id: string;
        city: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        state: string | null;
        latitude: number | null;
        longitude: number | null;
        weight: number;
    }) | null>;
    findByCity(city: string): Promise<({
        _count: {
            posts: number;
        };
    } & {
        id: string;
        city: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        state: string | null;
        latitude: number | null;
        longitude: number | null;
        weight: number;
    }) | null>;
}
