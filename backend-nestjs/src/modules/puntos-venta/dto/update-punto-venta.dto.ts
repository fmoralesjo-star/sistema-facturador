import { IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdatePuntoVentaDto {
    @IsString()
    @IsOptional()
    nombre?: string;

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsString()
    @IsOptional()
    @IsEnum(['TIENDA', 'BODEGA'])
    tipo?: string;

    @IsBoolean()
    @IsOptional()
    es_principal?: boolean;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;

    @IsOptional()
    secuencia_factura?: number;

    @IsOptional()
    secuencia_nota_credito?: number;
}
