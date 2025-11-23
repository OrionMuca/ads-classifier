"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ThemeService = class ThemeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.themeConfig.findMany({
            orderBy: [
                { isActive: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }
    async findActive() {
        const activeTheme = await this.prisma.themeConfig.findFirst({
            where: { isActive: true },
        });
        if (!activeTheme) {
            return this.getDefaultTheme();
        }
        return activeTheme;
    }
    async findOne(id) {
        const theme = await this.prisma.themeConfig.findUnique({
            where: { id },
        });
        if (!theme) {
            throw new common_1.NotFoundException(`Theme with ID ${id} not found`);
        }
        return theme;
    }
    async findByName(name) {
        const theme = await this.prisma.themeConfig.findUnique({
            where: { name },
        });
        if (!theme) {
            throw new common_1.NotFoundException(`Theme with name "${name}" not found`);
        }
        return theme;
    }
    async create(createThemeDto) {
        const existing = await this.prisma.themeConfig.findUnique({
            where: { name: createThemeDto.name },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Theme with name "${createThemeDto.name}" already exists`);
        }
        if (createThemeDto.isActive) {
            await this.deactivateAllThemes();
        }
        return this.prisma.themeConfig.create({
            data: createThemeDto,
        });
    }
    async update(id, updateThemeDto) {
        const existing = await this.findOne(id);
        if (updateThemeDto.name && updateThemeDto.name !== existing.name) {
            const nameConflict = await this.prisma.themeConfig.findUnique({
                where: { name: updateThemeDto.name },
            });
            if (nameConflict) {
                throw new common_1.BadRequestException(`Theme with name "${updateThemeDto.name}" already exists`);
            }
        }
        if (updateThemeDto.isActive === true) {
            await this.deactivateAllThemes();
        }
        return this.prisma.themeConfig.update({
            where: { id },
            data: updateThemeDto,
        });
    }
    async activate(id) {
        await this.findOne(id);
        await this.deactivateAllThemes();
        return this.prisma.themeConfig.update({
            where: { id },
            data: { isActive: true },
        });
    }
    async deactivate(id) {
        const theme = await this.findOne(id);
        if (!theme.isActive) {
            throw new common_1.BadRequestException(`Theme "${theme.name}" is already inactive`);
        }
        return this.prisma.themeConfig.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async remove(id) {
        const theme = await this.findOne(id);
        if (theme.isActive) {
            throw new common_1.BadRequestException('Cannot delete the active theme. Please activate another theme first.');
        }
        return this.prisma.themeConfig.delete({
            where: { id },
        });
    }
    async duplicate(id, newName) {
        const sourceTheme = await this.findOne(id);
        const existing = await this.prisma.themeConfig.findUnique({
            where: { name: newName },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Theme with name "${newName}" already exists`);
        }
        const { id: _, name: __, createdAt: ___, updatedAt: ____, ...themeData } = sourceTheme;
        return this.prisma.themeConfig.create({
            data: {
                ...themeData,
                name: newName,
                isActive: false,
            },
        });
    }
    async deactivateAllThemes() {
        await this.prisma.themeConfig.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });
    }
    getDefaultTheme() {
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
};
exports.ThemeService = ThemeService;
exports.ThemeService = ThemeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ThemeService);
//# sourceMappingURL=theme.service.js.map