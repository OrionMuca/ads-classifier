import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const categories = await this.prisma.category.findMany({
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

        // Calculate total count including subcategories for each parent category
        return categories.map(category => {
            // Count posts directly in this category
            const directPostCount = category._count.posts;
            
            // Sum posts from all subcategories
            const subcategoryPostCount = category.children.reduce(
                (sum, child) => sum + (child._count?.posts || 0),
                0
            );
            
            // Total count = direct posts + subcategory posts
            const totalPostCount = directPostCount + subcategoryPostCount;

            return {
                ...category,
                _count: {
                    ...category._count,
                    posts: totalPostCount, // Override with total count
                },
            };
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

    /**
     * Get all category IDs that should be included when filtering by a parent category
     * Returns the category itself + all its children (for hierarchical filtering)
     * 
     * @param categoryId - The parent category ID
     * @returns Array of category IDs (parent + all children)
     */
    async getCategoryIdsForFilter(categoryId: string): Promise<string[]> {
        try {
            // Get the category with its children
            const category = await this.prisma.category.findUnique({
                where: { id: categoryId },
                include: {
                    children: {
                        select: { id: true },
                    },
                },
            });

            if (!category) {
                // Category doesn't exist, return empty array
                return [];
            }

            // Return the parent ID + all child IDs
            const categoryIds = [categoryId];
            if (category.children && category.children.length > 0) {
                categoryIds.push(...category.children.map(child => child.id));
            }

            return categoryIds;
        } catch (error) {
            // In case of error, return just the original categoryId as fallback
            console.error('Error getting category IDs for filter:', error);
            return [categoryId];
        }
    }
}
