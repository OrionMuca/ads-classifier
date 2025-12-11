import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionService {
    constructor(private prisma: PrismaService) {}

    /**
     * Get all available plans
     */
    async getAllPlans() {
        return this.prisma.planConfig.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });
    }

    /**
     * Get user's current subscription details
     */
    async getUserSubscription(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscription: true,
                subscriptionStatus: true,
                subscriptionEndsAt: true,
            },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const planConfig = await this.prisma.planConfig.findUnique({
            where: { plan: user.subscription },
        });

        // Count active posts
        const activePostsCount = await this.prisma.post.count({
            where: {
                userId,
                status: 'ACTIVE',
            },
        });

        return {
            ...user,
            planConfig,
            activePostsCount,
        };
    }

    /**
     * Request plan upgrade
     */
    async requestUpgrade(userId: string, plan: SubscriptionPlan, notes?: string) {
        // Check if user already has a pending request
        const existingRequest = await this.prisma.subscriptionHistory.findFirst({
            where: {
                userId,
                status: 'PENDING',
            },
        });

        if (existingRequest) {
            throw new BadRequestException(
                'Keni tashmë një kërkesë në pritje. Ju lutemi prisni për miratimin e administratorit.',
            );
        }

        // Validate that the requested plan is higher than current
        const currentPlan = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { subscription: true },
        });

        if (!currentPlan) {
            throw new BadRequestException('User not found');
        }

        const planHierarchy = { FREE: 0, BASIC: 1, PREMIUM: 2 };
        if (planHierarchy[plan] <= planHierarchy[currentPlan.subscription]) {
            throw new BadRequestException(
                'Mund të kërkoni vetëm një plan më të lartë se plani juaj aktual.',
            );
        }

        return this.prisma.subscriptionHistory.create({
            data: {
                userId,
                plan,
                status: 'PENDING',
                notes,
            },
        });
    }

    /**
     * Approve subscription request (admin only)
     */
    async approveSubscription(historyId: string, adminId: string) {
        const request = await this.prisma.subscriptionHistory.findUnique({
            where: { id: historyId },
        });

        if (!request) {
            throw new BadRequestException('Kërkesa nuk u gjet.');
        }

        if (request.status !== 'PENDING') {
            throw new BadRequestException('Kjo kërkesë është tashmë procesuar.');
        }

        // Calculate expiration date (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Update user's subscription
        await this.prisma.user.update({
            where: { id: request.userId },
            data: {
                subscription: request.plan,
                subscriptionStatus: 'ACTIVE',
                subscriptionEndsAt: request.plan === 'FREE' ? null : expiresAt,
            },
        });

        // Update subscription history
        return this.prisma.subscriptionHistory.update({
            where: { id: historyId },
            data: {
                status: 'ACTIVE',
                approvedAt: new Date(),
                approvedBy: adminId,
                expiresAt: request.plan === 'FREE' ? null : expiresAt,
            },
        });
    }

    /**
     * Reject subscription request (admin only)
     */
    async rejectSubscription(historyId: string, adminId: string, reason?: string) {
        const request = await this.prisma.subscriptionHistory.findUnique({
            where: { id: historyId },
        });

        if (!request) {
            throw new BadRequestException('Kërkesa nuk u gjet.');
        }

        if (request.status !== 'PENDING') {
            throw new BadRequestException('Kjo kërkesë është tashmë procesuar.');
        }

        return this.prisma.subscriptionHistory.update({
            where: { id: historyId },
            data: {
                status: 'CANCELLED',
                approvedBy: adminId,
                notes: reason || request.notes,
            },
        });
    }

    /**
     * Check if user can create more posts
     */
    async checkPostLimit(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { subscription: true },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const planConfig = await this.prisma.planConfig.findUnique({
            where: { plan: user.subscription },
        });

        if (!planConfig) {
            throw new BadRequestException('Plan configuration not found');
        }

        const activePostsCount = await this.prisma.post.count({
            where: {
                userId,
                status: 'ACTIVE',
            },
        });

        if (activePostsCount >= planConfig.maxPosts) {
            return {
                allowed: false,
                reason: `Keni arritur kufirin e postimeve për planin ${planConfig.name} (${planConfig.maxPosts} postime). Ju lutemi përmirësoni planin tuaj për të postuar më shumë.`,
            };
        }

        return { allowed: true };
    }

    /**
     * Check if user can upload specified number of images
     */
    async checkImageLimit(
        userId: string,
        imageCount: number,
    ): Promise<{ allowed: boolean; reason?: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { subscription: true },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const planConfig = await this.prisma.planConfig.findUnique({
            where: { plan: user.subscription },
        });

        if (!planConfig) {
            throw new BadRequestException('Plan configuration not found');
        }

        if (imageCount > planConfig.maxImagesPerPost) {
            return {
                allowed: false,
                reason: `Mund të ngarkoni maksimumi ${planConfig.maxImagesPerPost} foto për postim në planin ${planConfig.name}.`,
            };
        }

        return { allowed: true };
    }

    /**
     * Get pending subscription requests (admin)
     */
    async getPendingRequests(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [requests, total] = await Promise.all([
            this.prisma.subscriptionHistory.findMany({
                where: { status: 'PENDING' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            subscription: true,
                        },
                    },
                },
                orderBy: { requestedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.subscriptionHistory.count({
                where: { status: 'PENDING' },
            }),
        ]);

        return {
            requests,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get active subscriptions (admin)
     */
    async getActiveSubscriptions(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [subscriptions, total] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    subscriptionStatus: 'ACTIVE',
                    subscription: {
                        not: 'FREE',
                    },
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    subscription: true,
                    subscriptionEndsAt: true,
                },
                orderBy: { subscriptionEndsAt: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.user.count({
                where: {
                    subscriptionStatus: 'ACTIVE',
                    subscription: {
                        not: 'FREE',
                    },
                },
            }),
        ]);

        return {
            subscriptions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get user's subscription history
     */
    async getUserHistory(userId: string) {
        return this.prisma.subscriptionHistory.findMany({
            where: { userId },
            orderBy: { requestedAt: 'desc' },
        });
    }

    /**
     * Update plan configuration (admin only)
     */
    async updatePlanConfig(
        plan: SubscriptionPlan,
        data: {
            price?: number;
            maxPosts?: number;
            maxImagesPerPost?: number;
            features?: string[];
            isActive?: boolean;
        },
    ) {
        return this.prisma.planConfig.update({
            where: { plan },
            data,
        });
    }

    /**
     * Expire subscriptions (cron job)
     * This should be called daily
     */
    async expireSubscriptions() {
        const now = new Date();

        // Find users with expired subscriptions
        const expiredUsers = await this.prisma.user.findMany({
            where: {
                subscriptionEndsAt: {
                    lte: now,
                },
                subscriptionStatus: 'ACTIVE',
            },
        });

        // Update users to FREE plan
        for (const user of expiredUsers) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    subscription: 'FREE',
                    subscriptionStatus: 'EXPIRED',
                    subscriptionEndsAt: null,
                },
            });

            // Update subscription history
            await this.prisma.subscriptionHistory.updateMany({
                where: {
                    userId: user.id,
                    status: 'ACTIVE',
                },
                data: {
                    status: 'EXPIRED',
                },
            });
        }

        return { expiredCount: expiredUsers.length };
    }
}
