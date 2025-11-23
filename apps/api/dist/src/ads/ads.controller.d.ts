import { AdsService } from './ads.service';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
export declare class AdsController {
    private readonly adsService;
    constructor(adsService: AdsService);
    findAll(activeOnly?: string): Promise<{
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
    trackView(id: string): Promise<{
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
    trackClick(id: string): Promise<{
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
    findAllAdmin(): Promise<{
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
    remove(id: string): Promise<void>;
}
