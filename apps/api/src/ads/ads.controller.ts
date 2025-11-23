import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('ads')
export class AdsController {
    constructor(private readonly adsService: AdsService) { }

    // Public endpoint - get active ads only
    @Get()
    findAll(@Query('activeOnly') activeOnly?: string) {
        return this.adsService.findAll(activeOnly === 'true');
    }

    // Public endpoint - track ad view
    @Post(':id/view')
    @HttpCode(HttpStatus.OK)
    trackView(@Param('id') id: string) {
        return this.adsService.incrementView(id);
    }

    // Public endpoint - track ad click
    @Post(':id/click')
    @HttpCode(HttpStatus.OK)
    trackClick(@Param('id') id: string) {
        return this.adsService.incrementClick(id);
    }

    // Admin endpoints - specific routes before dynamic ones
    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get('admin/all')
    findAllAdmin() {
        return this.adsService.findAll(false);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get('admin/:id')
    findOne(@Param('id') id: string) {
        return this.adsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createAdDto: CreateAdDto) {
        return this.adsService.create(createAdDto);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(@Param('id') id: string, @Body() updateAdDto: UpdateAdDto) {
        return this.adsService.update(id, updateAdDto);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.adsService.remove(id);
    }
}

