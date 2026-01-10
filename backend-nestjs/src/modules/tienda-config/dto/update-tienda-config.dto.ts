import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTiendaConfigDto {
    @IsOptional() @IsString() bannerTitulo?: string;
    @IsOptional() @IsString() bannerSubtitulo?: string;
    @IsOptional() @IsString() colorPrimario?: string;
    @IsOptional() @IsString() colorSecundario?: string;
    @IsOptional() @IsString() bannerImagenUrl?: string;
    @IsOptional() @IsBoolean() mostrarBanner?: boolean;
}
