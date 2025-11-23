import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';

@Injectable()
export class AdsService {
    constructor(private prisma: PrismaService) { }

    async create(createAdDto: CreateAdDto) {
        return this.prisma.ad.create({
            data: {
                title: createAdDto.title,
                image: createAdDto.image,
                link: createAdDto.link,
                position: createAdDto.position,
                layout: createAdDto.layout ?? 'CARD',
                active: createAdDto.active ?? true,
            },
        });
    }

    async findAll(activeOnly: boolean = false) {
        const where = activeOnly ? { active: true } : {};
        return this.prisma.ad.findMany({
            where,
            orderBy: [
                { position: 'asc' },
                { createdAt: 'desc' },
            ],
        });
    }

    async findOne(id: string) {
        const ad = await this.prisma.ad.findUnique({
            where: { id },
        });

        if (!ad) {
            throw new NotFoundException(`Ad with ID ${id} not found`);
        }

        return ad;
    }

    async update(id: string, updateAdDto: UpdateAdDto) {
        // Verify ad exists
        const ad = await this.prisma.ad.findUnique({ where: { id } });
        if (!ad) {
            throw new NotFoundException(`Ad with ID ${id} not found`);
        }

        return this.prisma.ad.update({
            where: { id },
            data: updateAdDto,
        });
    }

    async remove(id: string) {
        // Verify ad exists
        const ad = await this.prisma.ad.findUnique({ where: { id } });
        if (!ad) {
            throw new NotFoundException(`Ad with ID ${id} not found`);
        }

        return this.prisma.ad.delete({
            where: { id },
        });
    }

    async incrementView(id: string) {
        // Silently fail if ad doesn't exist (for analytics)
        try {
            return await this.prisma.ad.update({
                where: { id },
                data: {
                    viewCount: {
                        increment: 1,
                    },
                },
            });
        } catch (error) {
            // Ad might not exist, but we don't want to break the user experience
            return null;
        }
    }

    async incrementClick(id: string) {
        // Silently fail if ad doesn't exist (for analytics)
        try {
            return await this.prisma.ad.update({
                where: { id },
                data: {
                    clickCount: {
                        increment: 1,
                    },
                },
            });
        } catch (error) {
            // Ad might not exist, but we don't want to break the user experience
            return null;
        }
    }
}

