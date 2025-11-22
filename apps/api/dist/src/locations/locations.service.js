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
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LocationsService = class LocationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.location.findMany({
            orderBy: { weight: 'desc' },
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
    async findOne(id) {
        return this.prisma.location.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
    }
    async findByCity(city) {
        return this.prisma.location.findFirst({
            where: { city, country: 'Albania' },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
    }
    async findNearby(latitude, longitude, radiusKm = 50) {
        return this.findAll();
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map