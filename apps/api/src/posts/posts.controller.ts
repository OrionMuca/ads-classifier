import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Get()
    findAll(@Query('page') page: string, @Query('limit') limit: string) {
        return this.postsService.findAll(
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    // Specific routes before dynamic ones
    @UseGuards(JwtAuthGuard)
    @Get('user/:userId')
    findByUserId(@Param('userId') userId: string) {
        return this.postsService.findByUserId(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createPostDto: CreatePostDto, @Req() req: any) {
        return this.postsService.create(createPostDto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(
        @Param('id') id: string,
        @Body() updatePostDto: UpdatePostDto,
        @Req() req: any,
    ) {
        return this.postsService.update(id, updatePostDto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @Req() req: any) {
        await this.postsService.remove(id, req.user.userId);
    }
}
