import { IsString, IsNumber, IsArray, IsOptional, Min, IsUUID, IsEnum } from 'class-validator';

enum PostStatus {
    ACTIVE = 'ACTIVE',
    SOLD = 'SOLD',
    HIDDEN = 'HIDDEN',
    DELETED = 'DELETED',
}

export class CreatePostDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsUUID()
    categoryId: string;

    @IsUUID()
    locationId: string;

    @IsUUID()
    @IsOptional()
    zoneId?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];
}

export class UpdatePostDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsUUID()
    @IsOptional()
    locationId?: string;

    @IsUUID()
    @IsOptional()
    zoneId?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @IsEnum(PostStatus)
    @IsOptional()
    status?: PostStatus;
}
