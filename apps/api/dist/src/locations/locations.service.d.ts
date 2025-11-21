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
    }[]>;
}
