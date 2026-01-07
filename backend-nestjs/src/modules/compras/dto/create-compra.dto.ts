import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompraDetalleDto {
  @IsNotEmpty()
  @IsNumber()
  producto_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio_unitario: number;
}

export class CreateCompraDto {
  @IsOptional()
  @IsNumber()
  proveedor_id?: number;

  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  autorizacion?: string;


  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompraDetalleDto)
  detalles: CreateCompraDetalleDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  impuesto?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  punto_venta_id?: number;
}


