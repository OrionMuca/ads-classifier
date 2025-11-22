import {
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @UseGuards(JwtAuthGuard)
    @Post('image')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
        }),
    )
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        try {
            const imageUrl = await this.uploadService.uploadImage(file);
            return { url: imageUrl };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('images')
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            storage: memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB per file
            },
        }),
    )
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        try {
            const imageUrls = await this.uploadService.uploadMultipleImages(files);
            return { urls: imageUrls };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}

