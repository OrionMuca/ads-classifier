import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
    private readonly uploadPath: string;
    private readonly baseUrl: string;

    constructor(private configService: ConfigService) {
        // Create uploads directory if it doesn't exist
        this.uploadPath = path.join(process.cwd(), 'uploads', 'posts');
        this.baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
        
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    async uploadImage(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new Error('No file provided');
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only images are allowed.');
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File size exceeds 5MB limit.');
        }

        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const fileName = `${randomUUID()}${fileExtension}`;
        const filePath = path.join(this.uploadPath, fileName);

        // Save file
        fs.writeFileSync(filePath, file.buffer);

        // Return full URL
        const fullUrl = `${this.baseUrl}/uploads/posts/${fileName}`;
        return fullUrl;
    }

    async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }

        // Limit to 10 images max
        if (files.length > 10) {
            throw new Error('Maximum 10 images allowed');
        }

        const uploadPromises = files.map(file => this.uploadImage(file));
        return Promise.all(uploadPromises);
    }

    async deleteImage(imageUrl: string): Promise<void> {
        try {
            // Extract filename from URL
            const fileName = path.basename(imageUrl);
            const filePath = path.join(this.uploadPath, fileName);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            // Don't throw - image might not exist or be on external storage
        }
    }
}

