import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ThemeService } from './theme.service';
import { CreateThemeDto, UpdateThemeDto } from './dto/theme.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('theme')
export class ThemeController {
    constructor(private readonly themeService: ThemeService) {}

    /**
     * Get active theme (public endpoint)
     * GET /theme/active
     */
    @Get('active')
    @HttpCode(HttpStatus.OK)
    async getActive() {
        return this.themeService.findActive();
    }

    /**
     * Get all themes (admin only)
     * GET /theme
     */
    @Get()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async findAll() {
        return this.themeService.findAll();
    }

    /**
     * Get theme by ID (admin only)
     * GET /theme/:id
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        return this.themeService.findOne(id);
    }

    /**
     * Create a new theme (admin only)
     * POST /theme
     */
    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createThemeDto: CreateThemeDto) {
        return this.themeService.create(createThemeDto);
    }

    /**
     * Update a theme (admin only)
     * PATCH /theme/:id
     */
    @Patch(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateThemeDto: UpdateThemeDto) {
        return this.themeService.update(id, updateThemeDto);
    }

    /**
     * Activate a theme (admin only)
     * POST /theme/:id/activate
     */
    @Post(':id/activate')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async activate(@Param('id') id: string) {
        return this.themeService.activate(id);
    }

    /**
     * Deactivate a theme (admin only)
     * POST /theme/:id/deactivate
     */
    @Post(':id/deactivate')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async deactivate(@Param('id') id: string) {
        return this.themeService.deactivate(id);
    }

    /**
     * Duplicate a theme (admin only)
     * POST /theme/:id/duplicate
     */
    @Post(':id/duplicate')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.CREATED)
    async duplicate(@Param('id') id: string, @Body() body: { name: string }) {
        return this.themeService.duplicate(id, body.name);
    }

    /**
     * Delete a theme (admin only)
     * DELETE /theme/:id
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string) {
        return this.themeService.remove(id);
    }
}

