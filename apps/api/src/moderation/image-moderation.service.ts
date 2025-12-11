import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs-node';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class ImageModerationService implements OnModuleInit {
    private model: nsfwjs.NSFWJS;
    private readonly logger = new Logger(ImageModerationService.name);
    private isEnabled: boolean;
    private threshold: number;

    async onModuleInit() {
        this.isEnabled = process.env.NSFW_DETECTION_ENABLED !== 'false'; // Enabled by default
        this.threshold = parseFloat(process.env.NSFW_THRESHOLD || '0.6');

        if (this.isEnabled) {
            try {
                this.logger.log('Loading NSFW detection model...');
                this.model = await nsfwjs.load();
                this.logger.log('NSFW detection model loaded successfully');
            } catch (error) {
                this.logger.error('Failed to load NSFW model:', error);
                this.isEnabled = false;
            }
        } else {
            this.logger.warn('NSFW detection is disabled');
        }
    }

    /**
     * Check if an image is NSFW (Not Safe For Work)
     * Returns true if image should be blocked
     */
    async isImageNSFW(imageUrl: string): Promise<boolean> {
        if (!this.isEnabled || !this.model) {
            // If disabled or model not loaded, allow all images
            return false;
        }

        try {
            // Download image
            const imageBuffer = await this.downloadImage(imageUrl);

            // Convert buffer to tensor
            const image = tf.node.decodeImage(imageBuffer, 3);

            // Classify image
            const predictions = await this.model.classify(image as any);
            image.dispose();

            // Check predictions
            const nsfwScore = this.calculateNSFWScore(predictions);

            this.logger.debug(
                `Image analysis: ${imageUrl} - NSFW Score: ${nsfwScore.toFixed(2)} (threshold: ${this.threshold})`,
            );

            return nsfwScore >= this.threshold;
        } catch (error) {
            this.logger.error(`Error analyzing image ${imageUrl}:`, error);
            // On error, allow the image (fail open)
            return false;
        }
    }

    /**
     * Calculate NSFW score from predictions
     * Combines Porn, Sexy, and Hentai scores
     */
    private calculateNSFWScore(predictions: nsfwjs.PredictionType[]): number {
        const nsfwCategories = ['Porn', 'Sexy', 'Hentai'];
        let maxScore = 0;

        for (const prediction of predictions) {
            if (nsfwCategories.includes(prediction.className)) {
                maxScore = Math.max(maxScore, prediction.probability);
            }
        }

        return maxScore;
    }

    /**
     * Download image from URL
     */
    private downloadImage(url: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            const timeout = 10000; // 10 seconds timeout

            const request = protocol.get(url, { timeout }, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download image: ${response.statusCode}`));
                    return;
                }

                const chunks: Buffer[] = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
                response.on('error', reject);
            });

            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Image download timeout'));
            });
        });
    }

    /**
     * Validate multiple images
     * Returns array of blocked image URLs
     */
    async validateImages(imageUrls: string[]): Promise<string[]> {
        const blockedImages: string[] = [];

        for (const url of imageUrls) {
            const isNsfw = await this.isImageNSFW(url);
            if (isNsfw) {
                blockedImages.push(url);
            }
        }

        return blockedImages;
    }

    /**
     * Check if NSFW detection is enabled
     */
    isNSFWDetectionEnabled(): boolean {
        return this.isEnabled && this.model !== null;
    }
}
