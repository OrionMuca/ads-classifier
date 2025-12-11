import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionPlan } from '@prisma/client';

@Controller('subscription')
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @Get('plans')
    getAllPlans() {
        return this.subscriptionService.getAllPlans();
    }

    @Get('my-subscription')
    @UseGuards(JwtAuthGuard)
    getUserSubscription(@Request() req: any) {
        return this.subscriptionService.getUserSubscription(req.user.userId);
    }

    @Post('request')
    @UseGuards(JwtAuthGuard)
    requestUpgrade(
        @Request() req: any,
        @Body() body: { plan: SubscriptionPlan; notes?: string },
    ) {
        return this.subscriptionService.requestUpgrade(
            req.user.userId,
            body.plan,
            body.notes,
        );
    }

    @Get('history')
    @UseGuards(JwtAuthGuard)
    getUserHistory(@Request() req: any) {
        return this.subscriptionService.getUserHistory(req.user.userId);
    }
}
