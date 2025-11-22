import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZonesService {
    constructor(private prisma: PrismaService) { }

    async findByLocationId(locationId: string) {
        return this.prisma.zone.findMany({
            where: { locationId },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.zone.findUnique({
            where: { id },
            include: {
                location: true,
            },
        });
    }

    async findAll() {
        return this.prisma.zone.findMany({
            include: {
                location: {
                    select: {
                        id: true,
                        city: true,
                        country: true,
                    },
                },
            },
            orderBy: [
                { location: { weight: 'desc' } },
                { name: 'asc' },
            ],
        });
    }
}

