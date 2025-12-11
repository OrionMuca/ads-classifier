import { Module, Global } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { ImageModerationService } from './image-moderation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global() // Make it available globally
@Module({
    imports: [PrismaModule],
    providers: [ModerationService, ImageModerationService],
    exports: [ModerationService, ImageModerationService],
})
export class ModerationModule {}
