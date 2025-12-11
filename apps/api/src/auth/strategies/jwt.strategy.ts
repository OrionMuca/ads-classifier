import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-key',
        });
    }

    async validate(payload: any) {
        // Fetch user from database to get role and check if active
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            },
        });

        if (!user) {
            return null;
        }

        // Block deactivated users from accessing the system
        if (!user.isActive) {
            return null;
        }

        return {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
    }
}
