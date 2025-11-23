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
exports.AdsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdsService = class AdsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAdDto) {
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
    async findAll(activeOnly = false) {
        const where = activeOnly ? { active: true } : {};
        return this.prisma.ad.findMany({
            where,
            orderBy: [
                { position: 'asc' },
                { createdAt: 'desc' },
            ],
        });
    }
    async findOne(id) {
        const ad = await this.prisma.ad.findUnique({
            where: { id },
        });
        if (!ad) {
            throw new common_1.NotFoundException(`Ad with ID ${id} not found`);
        }
        return ad;
    }
    async update(id, updateAdDto) {
        const ad = await this.prisma.ad.findUnique({ where: { id } });
        if (!ad) {
            throw new common_1.NotFoundException(`Ad with ID ${id} not found`);
        }
        return this.prisma.ad.update({
            where: { id },
            data: updateAdDto,
        });
    }
    async remove(id) {
        const ad = await this.prisma.ad.findUnique({ where: { id } });
        if (!ad) {
            throw new common_1.NotFoundException(`Ad with ID ${id} not found`);
        }
        return this.prisma.ad.delete({
            where: { id },
        });
    }
    async incrementView(id) {
        try {
            return await this.prisma.ad.update({
                where: { id },
                data: {
                    viewCount: {
                        increment: 1,
                    },
                },
            });
        }
        catch (error) {
            return null;
        }
    }
    async incrementClick(id) {
        try {
            return await this.prisma.ad.update({
                where: { id },
                data: {
                    clickCount: {
                        increment: 1,
                    },
                },
            });
        }
        catch (error) {
            return null;
        }
    }
};
exports.AdsService = AdsService;
exports.AdsService = AdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdsService);
//# sourceMappingURL=ads.service.js.map