import { AdLayout } from '@prisma/client';
export declare class CreateAdDto {
    title: string;
    image: string;
    link?: string;
    position: number;
    layout?: AdLayout;
    active?: boolean;
}
export declare class UpdateAdDto {
    title?: string;
    image?: string;
    link?: string;
    position?: number;
    layout?: AdLayout;
    active?: boolean;
}
