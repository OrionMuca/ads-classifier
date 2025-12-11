import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
    constructor(private prisma: PrismaService) {}

    /**
     * Get all conversations for a user
     */
    async getUserConversations(userId: string) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        content: true,
                        isRead: true,
                        createdAt: true,
                        senderId: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Calculate unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await this.prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        senderId: { not: userId },
                        isRead: false,
                    },
                });

                return {
                    ...conv,
                    unreadCount,
                    lastMessage: conv.messages[0] || null,
                };
            }),
        );

        return conversationsWithUnread;
    }

    /**
     * Get a single conversation with all messages
     */
    async getConversation(conversationId: string, userId: string) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        if (!conversation) {
            throw new NotFoundException('Biseda nuk u gjet.');
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(
            (p) => p.userId === userId,
        );

        if (!isParticipant) {
            throw new ForbiddenException('Nuk keni qasje në këtë bisedë.');
        }

        return conversation;
    }

    /**
     * Create a new conversation
     */
    async createConversation(participantIds: string[], postId?: string) {
        // Check if conversation already exists between these users
        if (participantIds.length === 2 && postId) {
            const existing = await this.prisma.conversation.findFirst({
                where: {
                    postId,
                    AND: [
                        {
                            participants: {
                                some: {
                                    userId: participantIds[0],
                                },
                            },
                        },
                        {
                            participants: {
                                some: {
                                    userId: participantIds[1],
                                },
                            },
                        },
                    ],
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });

            if (existing) {
                return existing;
            }
        }

        // Create new conversation
        const conversation = await this.prisma.conversation.create({
            data: {
                postId,
                participants: {
                    create: participantIds.map((userId) => ({
                        userId,
                    })),
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        return conversation;
    }

    /**
     * Send a message
     */
    async sendMessage(conversationId: string, senderId: string, content: string) {
        // Verify user is a participant
        const participant = await this.prisma.conversationParticipant.findFirst({
            where: {
                conversationId,
                userId: senderId,
            },
        });

        if (!participant) {
            throw new ForbiddenException('Nuk keni qasje në këtë bisedë.');
        }

        // Create message
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderId,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });

        // Update conversation timestamp
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        return message;
    }

    /**
     * Mark message as read
     */
    async markAsRead(messageId: string, userId: string) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
            include: {
                conversation: {
                    include: {
                        participants: true,
                    },
                },
            },
        });

        if (!message) {
            throw new NotFoundException('Mesazhi nuk u gjet.');
        }

        // Check if user is a participant
        const isParticipant = message.conversation.participants.some(
            (p) => p.userId === userId,
        );

        if (!isParticipant) {
            throw new ForbiddenException('Nuk keni qasje në këtë mesazh.');
        }

        // Only allow marking others' messages as read
        if (message.senderId === userId) {
            return message;
        }

        return this.prisma.message.update({
            where: { id: messageId },
            data: { isRead: true },
        });
    }

    /**
     * Mark all messages in conversation as read
     */
    async markConversationAsRead(conversationId: string, userId: string) {
        // Verify user is a participant
        const participant = await this.prisma.conversationParticipant.findFirst({
            where: {
                conversationId,
                userId,
            },
        });

        if (!participant) {
            throw new ForbiddenException('Nuk keni qasje në këtë bisedë.');
        }

        // Mark all messages from others as read
        await this.prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                isRead: false,
            },
            data: { isRead: true },
        });

        return { success: true };
    }
}
