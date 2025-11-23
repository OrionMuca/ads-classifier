import { IsString, IsBoolean, IsOptional, IsUrl, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateThemeDto {
    @IsString()
    @MinLength(1, { message: 'Theme name is required' })
    @MaxLength(100, { message: 'Theme name must not exceed 100 characters' })
    name: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    // Primary Colors
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary50 must be a valid hex color' })
    @IsOptional()
    primary50?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary100 must be a valid hex color' })
    @IsOptional()
    primary100?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary200 must be a valid hex color' })
    @IsOptional()
    primary200?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary300 must be a valid hex color' })
    @IsOptional()
    primary300?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary400 must be a valid hex color' })
    @IsOptional()
    primary400?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary500 must be a valid hex color' })
    @IsOptional()
    primary500?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary600 must be a valid hex color' })
    @IsOptional()
    primary600?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary700 must be a valid hex color' })
    @IsOptional()
    primary700?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary800 must be a valid hex color' })
    @IsOptional()
    primary800?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary900 must be a valid hex color' })
    @IsOptional()
    primary900?: string;

    // Secondary Colors (similar pattern)
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary50?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary100?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary200?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary300?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary400?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary500?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary600?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary700?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary800?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary900?: string;

    // Accent Colors (similar pattern)
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent50?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent100?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent200?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent300?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent400?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent500?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent600?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent700?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent800?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent900?: string;

    // UI Colors
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    background?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    surface?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    textPrimary?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    textSecondary?: string;

    // Branding
    @IsString()
    @IsUrl()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsUrl()
    @IsOptional()
    faviconUrl?: string;
}

export class UpdateThemeDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    @IsOptional()
    name?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    // Primary Colors (all optional)
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    primary50?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    primary100?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    primary200?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    primary300?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    primary400?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    primary500?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    primary600?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    primary700?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    primary800?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    primary900?: string;

    // Secondary Colors (all optional)
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary50?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary100?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary200?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary300?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary400?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary500?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary600?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary700?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary800?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    secondary900?: string;

    // Accent Colors (all optional)
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent50?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent100?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent200?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent300?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent400?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent500?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent600?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent700?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent800?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    accent900?: string;

    // UI Colors (all optional)
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    background?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    surface?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    textPrimary?: string;

    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    @IsOptional()
    textSecondary?: string;

    // Branding (all optional)
    @IsString()
    @IsUrl()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsUrl()
    @IsOptional()
    faviconUrl?: string;
}

