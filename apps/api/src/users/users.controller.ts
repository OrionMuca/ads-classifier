import {
    Controller,
    Get,
    Patch,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // Profile endpoints
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req) {
        return this.usersService.getProfile(req.user.userId);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateProfile(req.user.userId, dto);
    }

    // User's posts
    @Get('posts')
    @UseGuards(JwtAuthGuard)
    getUserPosts(
        @Request() req,
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        return this.usersService.getUserPosts(
            req.user.userId,
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    // Saved posts endpoints
    @Get('saved')
    @UseGuards(JwtAuthGuard)
    getSavedPosts(
        @Request() req,
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        return this.usersService.getSavedPosts(
            req.user.userId,
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    @Post('saved/:postId')
    @UseGuards(JwtAuthGuard)
    savePost(@Request() req, @Param('postId') postId: string) {
        return this.usersService.savePost(req.user.userId, postId);
    }

    @Delete('saved/:postId')
    @UseGuards(JwtAuthGuard)
    unsavePost(@Request() req, @Param('postId') postId: string) {
        return this.usersService.unsavePost(req.user.userId, postId);
    }

    @Get('saved/:postId/check')
    @UseGuards(JwtAuthGuard)
    checkSaved(@Request() req, @Param('postId') postId: string) {
        return this.usersService.isPostSaved(req.user.userId, postId);
    }
}
