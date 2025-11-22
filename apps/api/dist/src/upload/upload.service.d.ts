import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    private readonly uploadPath;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File): Promise<string>;
    uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]>;
    deleteImage(imageUrl: string): Promise<void>;
}
