import { PrismaService } from '../prisma/prisma.service';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
export declare class AdsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createAdDto: CreateAdDto): Promise<{
        id: string;
        title: string;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        link: string | null;
        position: number;
        active: boolean;
        clickCount: number;
    }>;
    findAll(activeOnly?: boolean): Promise<{
        id: string;
        title: string;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        link: string | null;
        position: number;
        active: boolean;
        clickCount: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        title: string;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        link: string | null;
        position: number;
        active: boolean;
        clickCount: number;
    }>;
    update(id: string, updateAdDto: UpdateAdDto): Promise<{
        id: string;
        title: string;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        link: string | null;
        position: number;
        active: boolean;
        clickCount: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        link: string | null;
        position: number;
        active: boolean;
        clickCount: number;
    }>;
    incrementView(id: string): Promise<{
        id: string;
        title: string;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        link: string | null;
        position: number;
        active: boolean;
        clickCount: number;
    } | null>;
    incrementClick(id: string): Promise<{
        id: string;
        title: string;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
        image: string;
        link: string | null;
        position: number;
        active: boolean;
        clickCount: number;
    } | null>;
}
