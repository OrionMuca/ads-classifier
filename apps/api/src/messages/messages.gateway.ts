import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ModerationService } from '../moderation/moderation.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
    cors: {
        origin: true,
        credentials: false,
    },
    namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('MessagesGateway');
    private userSockets = new Map<string, string>(); // userId -> socketId

    constructor(
        private messagesService: MessagesService,
        private moderationService: ModerationService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) {}

    async handleConnection(client: Socket) {
        try {
            // Extract token from handshake
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                this.logger.warn('Connection attempt without token');
                client.disconnect();
                return;
            }

            // Verify token
            const payload = this.jwtService.verify(token);
            const userId = payload.sub;

            // Store user-socket mapping
            this.userSockets.set(userId, client.id);
            client.data.userId = userId;

            this.logger.log(`User ${userId} connected with socket ${client.id}`);

            // Join user's personal room for direct messages
            client.join(`user:${userId}`);
        } catch (error) {
            this.logger.error('Connection authentication failed:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            this.userSockets.delete(userId);
            this.logger.log(`User ${userId} disconnected`);
        }
    }

    @SubscribeMessage('join_conversation')
    async handleJoinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        try {
            const userId = client.data.userId;
            const conversation = await this.messagesService.getConversation(
                data.conversationId,
                userId,
            );

            // Join conversation room
            client.join(`conversation:${data.conversationId}`);

            this.logger.log(`User ${userId} joined conversation ${data.conversationId}`);

            return { success: true, conversation };
        } catch (error) {
            this.logger.error('Error joining conversation:', error);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('leave_conversation')
    handleLeaveConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        client.leave(`conversation:${data.conversationId}`);
        this.logger.log(`User ${client.data.userId} left conversation ${data.conversationId}`);
        return { success: true };
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string; content: string },
    ) {
        try {
            const userId = client.data.userId;

            // Validate conversationId
            if (!data.conversationId) {
                this.logger.error('Missing conversationId in send_message request');
                return {
                    success: false,
                    error: 'ID e bisedës nuk është e vlefshme.',
                };
            }

            // Validate content
            if (!data.content || !data.content.trim()) {
                return {
                    success: false,
                    error: 'Mesazhi nuk mund të jetë bosh.',
                };
            }

            // Validate content for blacklisted words
            const containsBlacklist = await this.moderationService.containsBlacklistedWords(
                data.content,
            );

            if (containsBlacklist) {
                return {
                    success: false,
                    error: 'Mesazhi përmban fjalë të ndaluara. Ju lutemi hiqni këto fjalë dhe provoni përsëri.',
                };
            }

            // Send message
            const message = await this.messagesService.sendMessage(
                data.conversationId,
                userId,
                data.content.trim(),
            );

            // Broadcast to conversation room
            this.server
                .to(`conversation:${data.conversationId}`)
                .emit('new_message', message);

            // Also notify other participants who aren't in the conversation room
            const conversation = await this.prisma.conversation.findUnique({
                where: { id: data.conversationId },
                include: { participants: true },
            });

            if (conversation) {
                conversation.participants.forEach((participant) => {
                    if (participant.userId !== userId) {
                        this.server
                            .to(`user:${participant.userId}`)
                            .emit('message_notification', {
                                conversationId: data.conversationId,
                                message,
                            });
                    }
                });
            }

            return { success: true, message };
        } catch (error) {
            this.logger.error('Error sending message:', error);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string; isTyping: boolean },
    ) {
        const userId = client.data.userId;

        // Broadcast typing indicator to conversation room (except sender)
        client.to(`conversation:${data.conversationId}`).emit('user_typing', {
            userId,
            isTyping: data.isTyping,
        });

        return { success: true };
    }

    @SubscribeMessage('mark_read')
    async handleMarkRead(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        try {
            const userId = client.data.userId;
            await this.messagesService.markConversationAsRead(data.conversationId, userId);

            // Notify other participants
            client.to(`conversation:${data.conversationId}`).emit('messages_read', {
                userId,
                conversationId: data.conversationId,
            });

            return { success: true };
        } catch (error) {
            this.logger.error('Error marking messages as read:', error);
            return { success: false, error: error.message };
        }
    }
}
