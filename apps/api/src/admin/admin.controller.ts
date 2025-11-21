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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // Statistics
    @Get('stats')
    getStats() {
        return this.adminService.getStats();
    }

    // User Management
    @Get('users')
    getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Patch('users/:id/role')
    updateUserRole(@Param('id') id: string, @Body() body: { role: 'USER' | 'ADMIN' }) {
        return this.adminService.updateUserRole(id, body.role);
    }

    @Delete('users/:id')
    deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }

    // Post Management
    @Get('posts')
    getAllPosts(@Query('page') page: string, @Query('limit') limit: string) {
        return this.adminService.getAllPosts(
            parseInt(page) || 1,
            parseInt(limit) || 50,
        );
    }

    @Delete('posts/:id')
    deletePost(@Param('id') id: string) {
        return this.adminService.deletePost(id);
    }

    // Elasticsearch Operations
    @Post('reindex')
    reindexPosts() {
        return this.adminService.reindexAllPosts();
    }

    // Categories Management
    @Get('categories')
    getAllCategories() {
        return this.adminService.getAllCategories();
    }

    // Locations Management
    @Get('locations')
    getAllLocations() {
        return this.adminService.getAllLocations();
    }
}
