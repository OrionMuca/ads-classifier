import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.location.findMany({
            orderBy: { weight: 'desc' }, // Albania-specific: ordered by weight (Tiranë first)
            select: {
                id: true,
                city: true,
                country: true,
                latitude: true,
                longitude: true,
                weight: true,
                hasZones: true,
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.location.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async findByCity(city: string) {
        return this.prisma.location.findFirst({
            where: { city, country: 'Albania' },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    // Search nearby cities by coordinates (for future geo-search)
    async findNearby(latitude: number, longitude: number, radiusKm: number = 50) {
        // Simplified: return all cities ordered by weight for now
        // Can be enhanced with PostGIS for true geo-queries
        return this.findAll();
    }
}
