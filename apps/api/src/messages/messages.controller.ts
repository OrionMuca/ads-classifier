import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get('conversations')
    getUserConversations(@Request() req: any) {
        return this.messagesService.getUserConversations(req.user.userId);
    }

    @Get('conversations/:id')
    getConversation(@Param('id') id: string, @Request() req: any) {
        return this.messagesService.getConversation(id, req.user.userId);
    }

    @Post('conversations')
    createConversation(
        @Body() body: { participantIds: string[]; postId?: string },
        @Request() req: any,
    ) {
        // Add current user to participants if not already included
        const participantIds = Array.from(
            new Set([...body.participantIds, req.user.userId]),
        );
        return this.messagesService.createConversation(participantIds, body.postId);
    }

    @Post(':conversationId/messages')
    sendMessage(
        @Param('conversationId') conversationId: string,
        @Body() body: { content: string },
        @Request() req: any,
    ) {
        return this.messagesService.sendMessage(
            conversationId,
            req.user.userId,
            body.content,
        );
    }

    @Patch('messages/:id/read')
    markAsRead(@Param('id') id: string, @Request() req: any) {
        return this.messagesService.markAsRead(id, req.user.userId);
    }

    @Patch('conversations/:id/read')
    markConversationAsRead(@Param('id') id: string, @Request() req: any) {
        return this.messagesService.markConversationAsRead(id, req.user.userId);
    }
}
