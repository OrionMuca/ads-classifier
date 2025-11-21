import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @Matches(/^(\+355|0)[6-9]\d{8}$/, {
        message: 'Phone must be a valid Albanian number (+355XXXXXXXX or 06XXXXXXXX)',
    })
    phone: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}
