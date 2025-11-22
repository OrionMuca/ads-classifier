import { PrismaService } from '../prisma/prisma.service';
export declare class LocationsService {
    private prisma;
    constructor(prisma: PrismaService);
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
        hasZones: boolean;
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
        hasZones: boolean;
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
        hasZones: boolean;
    }) | null>;
    findNearby(latitude: number, longitude: number, radiusKm?: number): Promise<{
        id: string;
        city: string;
        country: string;
        _count: {
            posts: number;
        };
        latitude: number | null;
        longitude: number | null;
        weight: number;
        hasZones: boolean;
    }[]>;
}
