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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_service_1 = require("./elasticsearch.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
let SearchController = class SearchController {
    elasticsearchService;
    prisma;
    constructor(elasticsearchService, prisma) {
        this.elasticsearchService = elasticsearchService;
        this.prisma = prisma;
    }
    async search(query, categoryId, locationId, minPrice, maxPrice, searchAfter, size, user) {
        const result = await this.elasticsearchService.search({
            query,
            categoryId,
            locationId,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            searchAfter: searchAfter ? JSON.parse(searchAfter) : undefined,
            size: size ? parseInt(size) : 20,
        });
        if (user?.userId) {
            await this.elasticsearchService.recordSearch(user.userId, {
                query,
                categoryId,
                locationId,
                resultCount: result.total,
            });
        }
        return result;
    }
    async getRecommendations(user, size) {
        return this.elasticsearchService.getPersonalizedRecommendations(user.userId, size ? parseInt(size) : 20);
    }
    async getSearchHistory(user, limit) {
        return this.elasticsearchService.getUserSearchHistory(user.userId, limit ? parseInt(limit) : 50);
    }
    async suggest(query) {
        return this.elasticsearchService.getSuggestions(query);
    }
    async reindex(user) {
        const posts = await this.prisma.post.findMany({
            include: {
                category: true,
                location: true,
            },
        });
        return this.elasticsearchService.reindexAll(posts);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('locationId')),
    __param(3, (0, common_1.Query)('minPrice')),
    __param(4, (0, common_1.Query)('maxPrice')),
    __param(5, (0, common_1.Query)('searchAfter')),
    __param(6, (0, common_1.Query)('size')),
    __param(7, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('recommendations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('size')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getSearchHistory", null);
__decorate([
    (0, common_1.Get)('suggest'),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "suggest", null);
__decorate([
    (0, common_1.Post)('reindex'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "reindex", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [elasticsearch_service_1.ElasticsearchService,
        prisma_service_1.PrismaService])
], SearchController);
//# sourceMappingURL=search.controller.js.map