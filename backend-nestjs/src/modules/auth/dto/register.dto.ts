
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    nombre_completo?: string;

    @IsString()
    @IsOptional()
    telefono?: string;
}
