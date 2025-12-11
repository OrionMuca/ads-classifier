import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class ModerationService implements OnModuleInit {
    private redis: Redis;
    private readonly CACHE_KEY = 'blacklist:words';
    private readonly CACHE_TTL = 3600; // 1 hour

    constructor(private prisma: PrismaService) {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
        });
    }

    async onModuleInit() {
        // Load blacklist into cache on startup
        await this.refreshCache();
    }

    /**
     * Check if text contains any blacklisted words
     */
    async containsBlacklistedWords(text: string): Promise<boolean> {
        const words = await this.getBlacklistedWordsInText(text);
        return words.length > 0;
    }

    /**
     * Get list of blacklisted words found in text
     */
    async getBlacklistedWordsInText(text: string): Promise<string[]> {
        const blacklist = await this.getBlacklist();
        const foundWords: string[] = [];
        const normalizedText = this.normalizeText(text);

        for (const word of blacklist) {
            const normalizedWord = this.normalizeText(word);
            // Check for exact word match (with word boundaries)
            const regex = new RegExp(`\\b${this.escapeRegex(normalizedWord)}\\b`, 'gi');
            if (regex.test(normalizedText)) {
                foundWords.push(word);
            }
        }

        return foundWords;
    }

    /**
     * Get all blacklisted words from cache or database
     */
    private async getBlacklist(): Promise<string[]> {
        // Try to get from cache first
        const cached = await this.redis.get(this.CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }

        // If not in cache, load from database
        return await this.refreshCache();
    }

    /**
     * Refresh blacklist cache from database
     */
    async refreshCache(): Promise<string[]> {
        const blacklistWords = await this.prisma.blacklistWord.findMany({
            select: { word: true },
        });

        const words = blacklistWords.map((item) => item.word);
        await this.redis.setex(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(words));

        return words;
    }

    /**
     * Add a word to blacklist
     */
    async addWord(word: string): Promise<void> {
        await this.prisma.blacklistWord.create({
            data: { word: word.toLowerCase().trim() },
        });
        await this.refreshCache();
    }

    /**
     * Remove a word from blacklist
     */
    async removeWord(id: string): Promise<void> {
        await this.prisma.blacklistWord.delete({
            where: { id },
        });
        await this.refreshCache();
    }

    /**
     * Get all blacklisted words (paginated)
     */
    async getAllWords(page: number = 1, limit: number = 50) {
        const skip = (page - 1) * limit;

        const [words, total] = await Promise.all([
            this.prisma.blacklistWord.findMany({
                skip,
                take: limit,
                orderBy: { word: 'asc' },
            }),
            this.prisma.blacklistWord.count(),
        ]);

        return {
            words,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Add multiple words at once (bulk upload)
     */
    async addBulkWords(words: string[]): Promise<{ added: number; failed: number }> {
        let added = 0;
        let failed = 0;

        for (const word of words) {
            try {
                const trimmedWord = word.toLowerCase().trim();
                if (trimmedWord) {
                    await this.prisma.blacklistWord.upsert({
                        where: { word: trimmedWord },
                        update: {},
                        create: { word: trimmedWord },
                    });
                    added++;
                }
            } catch (error) {
                failed++;
            }
        }

        await this.refreshCache();

        return { added, failed };
    }

    /**
     * Normalize text for comparison (lowercase, remove extra spaces)
     */
    private normalizeText(text: string): string {
        return text.toLowerCase().replace(/\s+/g, ' ').trim();
    }

    /**
     * Escape special regex characters
     */
    private escapeRegex(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
