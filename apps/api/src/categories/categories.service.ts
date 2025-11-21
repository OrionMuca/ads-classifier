import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            where: { parentId: null },
            orderBy: { name: 'asc' },
            include: {
                children: {
                    orderBy: { name: 'asc' },
                    include: {
                        _count: {
                            select: { posts: true },
                        },
                    },
                },
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true,
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async findBySlug(slug: string) {
        return this.prisma.category.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
    }
}
