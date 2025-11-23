import { IsString, IsNumber, IsBoolean, IsOptional, IsUrl, Min, MinLength, MaxLength, IsEnum } from 'class-validator';
import { AdLayout } from '@prisma/client';

export class CreateAdDto {
    @IsString()
    @MinLength(3, { message: 'Title must be at least 3 characters long' })
    @MaxLength(200, { message: 'Title must not exceed 200 characters' })
    title: string;

    @IsString()
    @IsUrl({}, { message: 'Image must be a valid URL' })
    image: string;

    @IsString()
    @IsUrl({}, { message: 'Link must be a valid URL' })
    @IsOptional()
    link?: string;

    @IsNumber()
    @Min(0, { message: 'Position must be 0 or greater' })
    position: number; // 0 = beginning, 5 = after 5 posts, etc.

    @IsEnum(AdLayout, { message: 'Layout must be either CARD or BANNER' })
    @IsOptional()
    layout?: AdLayout;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class UpdateAdDto {
    @IsString()
    @MinLength(3, { message: 'Title must be at least 3 characters long' })
    @MaxLength(200, { message: 'Title must not exceed 200 characters' })
    @IsOptional()
    title?: string;

    @IsString()
    @IsUrl({}, { message: 'Image must be a valid URL' })
    @IsOptional()
    image?: string;

    @IsString()
    @IsUrl({}, { message: 'Link must be a valid URL' })
    @IsOptional()
    link?: string;

    @IsNumber()
    @Min(0, { message: 'Position must be 0 or greater' })
    @IsOptional()
    position?: number;

    @IsEnum(AdLayout, { message: 'Layout must be either CARD or BANNER' })
    @IsOptional()
    layout?: AdLayout;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

