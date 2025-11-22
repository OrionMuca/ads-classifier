import { PrismaService } from '../prisma/prisma.service';
export declare class ZonesService {
    private prisma;
    constructor(prisma: PrismaService);
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
}
