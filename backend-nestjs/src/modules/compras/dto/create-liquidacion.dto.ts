import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateLiquidacionDto {
    @IsDateString()
    fecha_emision: string;

    @IsString()
    proveedor_identificacion: string;

    @IsString()
    proveedor_nombre: string;

    @IsOptional()
    @IsString()
    proveedor_direccion?: string;

    @IsOptional()
    @IsString()
    proveedor_telefono?: string;

    @IsOptional()
    @IsString()
    proveedor_email?: string;

    @IsString()
    concepto: string;

    @IsNumber()
    @Min(0)
    subtotal_0: number;

    @IsNumber()
    @Min(0)
    subtotal_12: number;

    @IsNumber()
    @Min(0)
    iva: number;

    @IsNumber()
    @Min(0)
    total: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    retencion_renta?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    retencion_iva?: number;

    @IsOptional()
    @IsString()
    codigo_retencion_renta?: string;

    @IsOptional()
    @IsString()
    codigo_retencion_iva?: string;

    @IsOptional()
    @IsString()
    observaciones?: string;
}
