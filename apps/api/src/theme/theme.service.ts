import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThemeDto, UpdateThemeDto } from './dto/theme.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ThemeService {
    constructor(private prisma: PrismaService) {}

    /**
     * Get all themes
     */
    async findAll() {
        return this.prisma.themeConfig.findMany({
            orderBy: [
                { isActive: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }

    /**
     * Get active theme
     */
    async findActive() {
        const activeTheme = await this.prisma.themeConfig.findFirst({
            where: { isActive: true },
        });

        if (!activeTheme) {
            // Return default theme if none is active
            return this.getDefaultTheme();
        }

        return activeTheme;
    }

    /**
     * Get theme by ID
     */
    async findOne(id: string) {
        const theme = await this.prisma.themeConfig.findUnique({
            where: { id },
        });

        if (!theme) {
            throw new NotFoundException(`Theme with ID ${id} not found`);
        }

        return theme;
    }

    /**
     * Get theme by name
     */
    async findByName(name: string) {
        const theme = await this.prisma.themeConfig.findUnique({
            where: { name },
        });

        if (!theme) {
            throw new NotFoundException(`Theme with name "${name}" not found`);
        }

        return theme;
    }

    /**
     * Create a new theme
     */
    async create(createThemeDto: CreateThemeDto) {
        // Check if theme name already exists
        const existing = await this.prisma.themeConfig.findUnique({
            where: { name: createThemeDto.name },
        });

        if (existing) {
            throw new BadRequestException(`Theme with name "${createThemeDto.name}" already exists`);
        }

        // If this theme is being set as active, deactivate all others
        if (createThemeDto.isActive) {
            await this.deactivateAllThemes();
        }

        return this.prisma.themeConfig.create({
            data: createThemeDto,
        });
    }

    /**
     * Update a theme
     */
    async update(id: string, updateThemeDto: UpdateThemeDto) {
        // Check if theme exists
        const existing = await this.findOne(id);

        // If name is being changed, check for conflicts
        if (updateThemeDto.name && updateThemeDto.name !== existing.name) {
            const nameConflict = await this.prisma.themeConfig.findUnique({
                where: { name: updateThemeDto.name },
            });

            if (nameConflict) {
                throw new BadRequestException(`Theme with name "${updateThemeDto.name}" already exists`);
            }
        }

        // If this theme is being set as active, deactivate all others
        if (updateThemeDto.isActive === true) {
            await this.deactivateAllThemes();
        }

        return this.prisma.themeConfig.update({
            where: { id },
            data: updateThemeDto,
        });
    }

    /**
     * Activate a theme (deactivates all others)
     */
    async activate(id: string) {
        // Check if theme exists
        await this.findOne(id);

        // Deactivate all themes
        await this.deactivateAllThemes();

        // Activate this theme
        return this.prisma.themeConfig.update({
            where: { id },
            data: { isActive: true },
        });
    }

    /**
     * Deactivate a theme
     */
    async deactivate(id: string) {
        const theme = await this.findOne(id);

        if (!theme.isActive) {
            throw new BadRequestException(`Theme "${theme.name}" is already inactive`);
        }

        return this.prisma.themeConfig.update({
            where: { id },
            data: { isActive: false },
        });
    }

    /**
     * Delete a theme
     */
    async remove(id: string) {
        const theme = await this.findOne(id);

        // Don't allow deleting the active theme
        if (theme.isActive) {
            throw new BadRequestException('Cannot delete the active theme. Please activate another theme first.');
        }

        return this.prisma.themeConfig.delete({
            where: { id },
        });
    }

    /**
     * Duplicate a theme
     */
    async duplicate(id: string, newName: string) {
        const sourceTheme = await this.findOne(id);

        // Check if new name already exists
        const existing = await this.prisma.themeConfig.findUnique({
            where: { name: newName },
        });

        if (existing) {
            throw new BadRequestException(`Theme with name "${newName}" already exists`);
        }

        // Create new theme with same values but new name
        const { id: _, name: __, createdAt: ___, updatedAt: ____, ...themeData } = sourceTheme;

        return this.prisma.themeConfig.create({
            data: {
                ...themeData,
                name: newName,
                isActive: false, // Duplicated themes are inactive by default
            },
        });
    }

    /**
     * Deactivate all themes
     */
    private async deactivateAllThemes() {
        await this.prisma.themeConfig.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });
    }

    /**
     * Get default theme configuration
     */
    private getDefaultTheme() {
        return {
            id: 'default',
            name: 'default',
            isActive: true,
            primary50: '#eef2ff',
            primary100: '#e0e7ff',
            primary200: '#c7d2fe',
            primary300: '#a5b4fc',
            primary400: '#818cf8',
            primary500: '#6366f1',
            primary600: '#4f46e5',
            primary700: '#4338ca',
            primary800: '#3730a3',
            primary900: '#312e81',
            secondary50: '#ecfdf5',
            secondary100: '#d1fae5',
            secondary200: '#a7f3d0',
            secondary300: '#6ee7b7',
            secondary400: '#34d399',
            secondary500: '#10b981',
            secondary600: '#059669',
            secondary700: '#047857',
            secondary800: '#065f46',
            secondary900: '#064e3b',
            accent50: '#fffbeb',
            accent100: '#fef3c7',
            accent200: '#fde68a',
            accent300: '#fcd34d',
            accent400: '#fbbf24',
            accent500: '#f59e0b',
            accent600: '#d97706',
            accent700: '#b45309',
            accent800: '#92400e',
            accent900: '#78350f',
            background: '#f8fafc',
            surface: '#ffffff',
            textPrimary: '#0f172a',
            textSecondary: '#64748b',
            logoUrl: null,
            faviconUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}

