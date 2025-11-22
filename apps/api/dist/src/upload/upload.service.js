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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const crypto_1 = require("crypto");
let UploadService = class UploadService {
    configService;
    uploadPath;
    baseUrl;
    constructor(configService) {
        this.configService = configService;
        this.uploadPath = path.join(process.cwd(), 'uploads', 'posts');
        this.baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }
    async uploadImage(file) {
        if (!file) {
            throw new Error('No file provided');
        }
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only images are allowed.');
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File size exceeds 5MB limit.');
        }
        const fileExtension = path.extname(file.originalname);
        const fileName = `${(0, crypto_1.randomUUID)()}${fileExtension}`;
        const filePath = path.join(this.uploadPath, fileName);
        fs.writeFileSync(filePath, file.buffer);
        const fullUrl = `${this.baseUrl}/uploads/posts/${fileName}`;
        return fullUrl;
    }
    async uploadMultipleImages(files) {
        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }
        if (files.length > 10) {
            throw new Error('Maximum 10 images allowed');
        }
        const uploadPromises = files.map(file => this.uploadImage(file));
        return Promise.all(uploadPromises);
    }
    async deleteImage(imageUrl) {
        try {
            const fileName = path.basename(imageUrl);
            const filePath = path.join(this.uploadPath, fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.error('Error deleting image:', error);
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map