import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreatePuntoVentaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    codigo: string;

    @IsString()
    @IsNotEmpty()
    direccion: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['TIENDA', 'BODEGA'])
    tipo: string;

    @IsBoolean()
    @IsOptional()
    es_principal?: boolean;

    @IsOptional()
    secuencia_factura?: number;

    @IsOptional()
    secuencia_nota_credito?: number;
}
