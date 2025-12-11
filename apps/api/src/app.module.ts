import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { SearchModule } from './search/search.module';
import { AdminModule } from './admin/admin.module';
import { CategoriesModule } from './categories/categories.module';
import { LocationsModule } from './locations/locations.module';
import { UploadModule } from './upload/upload.module';
import { ZonesModule } from './zones/zones.module';
import { AdsModule } from './ads/ads.module';
import { ThemeModule } from './theme/theme.module';
import { ModerationModule } from './moderation/moderation.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ModerationModule,
    SubscriptionModule,
    MessagesModule,
    UsersModule,
    PostsModule,
    AuthModule,
    SearchModule,
    AdminModule,
    CategoriesModule,
    LocationsModule,
    UploadModule,
    ZonesModule,
    AdsModule,
    ThemeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
