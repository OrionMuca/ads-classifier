import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Param,
    Body,
    UseGuards,
    Query,
    Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ModerationService } from '../moderation/moderation.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionPlan } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly moderationService: ModerationService,
        private readonly subscriptionService: SubscriptionService,
    ) { }

    // Statistics
    @Get('stats')
    getStats() {
        return this.adminService.getStats();
    }

    // User Management
    @Get('users')
    getAllUsers(@Query('page') page: string, @Query('limit') limit: string) {
        return this.adminService.getAllUsers(
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    @Patch('users/:id/role')
    updateUserRole(@Param('id') id: string, @Body() body: { role: 'USER' | 'ADMIN' }) {
        return this.adminService.updateUserRole(id, body.role);
    }

    @Delete('users/:id')
    deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }

    @Patch('users/:id/deactivate')
    deactivateUser(@Param('id') id: string) {
        return this.adminService.deactivateUser(id);
    }

    @Patch('users/:id/reactivate')
    reactivateUser(@Param('id') id: string) {
        return this.adminService.reactivateUser(id);
    }

    // Post Management
    @Get('posts')
    getAllPosts(@Query('page') page: string, @Query('limit') limit: string) {
        return this.adminService.getAllPosts(
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    @Delete('posts/:id')
    deletePost(@Param('id') id: string) {
        return this.adminService.deletePost(id);
    }

    // Elasticsearch Operations
    @Get('elasticsearch/health')
    getElasticsearchHealth() {
        return this.adminService.getElasticsearchHealth();
    }

    @Post('reindex')
    reindexPosts() {
        return this.adminService.reindexAllPosts();
    }

    @Post('fix-elasticsearch-alias')
    fixElasticsearchAlias() {
        return this.adminService.fixElasticsearchAlias();
    }

    // Categories Management
    @Get('categories')
    getAllCategories(@Query('page') page: string, @Query('limit') limit: string) {
        return this.adminService.getAllCategories(
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    @Post('categories')
    createCategory(@Body() body: { name: string; slug: string; icon?: string; description?: string; parentId?: string }) {
        return this.adminService.createCategory(body);
    }

    @Patch('categories/:id')
    updateCategory(@Param('id') id: string, @Body() body: { name?: string; slug?: string; icon?: string; description?: string; parentId?: string | null }) {
        return this.adminService.updateCategory(id, body);
    }

    @Delete('categories/:id')
    deleteCategory(@Param('id') id: string) {
        return this.adminService.deleteCategory(id);
    }

    // Locations Management
    @Get('locations')
    getAllLocations(@Query('page') page: string, @Query('limit') limit: string) {
        return this.adminService.getAllLocations(
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    @Post('locations')
    createLocation(@Body() body: { city: string; state?: string; country?: string; latitude?: number; longitude?: number; weight?: number; hasZones?: boolean }) {
        return this.adminService.createLocation(body);
    }

    @Patch('locations/:id')
    updateLocation(@Param('id') id: string, @Body() body: { city?: string; state?: string; country?: string; latitude?: number; longitude?: number; weight?: number; hasZones?: boolean }) {
        return this.adminService.updateLocation(id, body);
    }

    @Delete('locations/:id')
    deleteLocation(@Param('id') id: string) {
        return this.adminService.deleteLocation(id);
    }

    // Zones Management
    @Get('zones')
    getAllZones(@Query('page') page: string, @Query('limit') limit: string) {
        return this.adminService.getAllZones(
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    @Post('zones')
    createZone(@Body() body: { name: string; locationId: string }) {
        return this.adminService.createZone(body);
    }

    @Patch('zones/:id')
    updateZone(@Param('id') id: string, @Body() body: { name?: string; locationId?: string }) {
        return this.adminService.updateZone(id, body);
    }

    @Delete('zones/:id')
    deleteZone(@Param('id') id: string) {
        return this.adminService.deleteZone(id);
    }

    // Ads Management
    @Get('ads')
    getAllAds(@Query('page') page: string, @Query('limit') limit: string) {
        return this.adminService.getAllAds(
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    // Blacklist Words Management
    @Get('blacklist')
    getAllBlacklistWords(@Query('page') page: string, @Query('limit') limit: string) {
        return this.moderationService.getAllWords(
            parseInt(page) || 1,
            parseInt(limit) || 50,
        );
    }

    @Post('blacklist')
    addBlacklistWord(@Body() body: { word: string }) {
        return this.moderationService.addWord(body.word);
    }

    @Post('blacklist/bulk')
    addBulkBlacklistWords(@Body() body: { words: string[] }) {
        return this.moderationService.addBulkWords(body.words);
    }

    @Delete('blacklist/:id')
    removeBlacklistWord(@Param('id') id: string) {
        return this.moderationService.removeWord(id);
    }

    // Subscription Management
    @Get('subscriptions/pending')
    getPendingSubscriptions(@Query('page') page: string, @Query('limit') limit: string) {
        return this.subscriptionService.getPendingRequests(
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    @Get('subscriptions/active')
    getActiveSubscriptions(@Query('page') page: string, @Query('limit') limit: string) {
        return this.subscriptionService.getActiveSubscriptions(
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    @Patch('subscriptions/:id/approve')
    approveSubscription(@Param('id') id: string, @Request() req: any) {
        return this.subscriptionService.approveSubscription(id, req.user.userId);
    }

    @Patch('subscriptions/:id/reject')
    rejectSubscription(
        @Param('id') id: string,
        @Request() req: any,
        @Body() body: { reason?: string },
    ) {
        return this.subscriptionService.rejectSubscription(
            id,
            req.user.userId,
            body.reason,
        );
    }

    @Patch('subscriptions/plans/:plan')
    updatePlanConfig(
        @Param('plan') plan: SubscriptionPlan,
        @Body()
        body: {
            price?: number;
            maxPosts?: number;
            maxImagesPerPost?: number;
            features?: string[];
            isActive?: boolean;
        },
    ) {
        return this.subscriptionService.updatePlanConfig(plan, body);
    }
}
