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

export class CreateFacturaDetalleDto {
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

export class CreateFacturaDto {
  @IsNotEmpty()
  @IsNumber()
  cliente_id: number;

  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFacturaDetalleDto)
  detalles: CreateFacturaDetalleDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  impuesto?: number;

  // Campos SRI
  @IsOptional()
  @IsString()
  establecimiento?: string;

  @IsOptional()
  @IsString()
  punto_emision?: string;

  @IsOptional()
  @IsString()
  secuencial?: string;

  @IsOptional()
  @IsString()
  tipo_comprobante?: string;

  @IsOptional()
  @IsString()
  ambiente?: string;

  @IsOptional()
  @IsString()
  forma_pago?: string;

  @IsOptional()
  @IsString()
  condicion_pago?: string;

  // Retenciones Recibidas
  @IsOptional()
  @IsString()
  retencion_numero?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retencion_valor_ir?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retencion_valor_iva?: number;

  @IsOptional()
  @IsDateString()
  retencion_fecha?: Date;

  // Información del emisor
  @IsOptional()
  @IsString()
  emisor_ruc?: string;

  @IsOptional()
  @IsString()
  emisor_razon_social?: string;

  @IsOptional()
  @IsString()
  emisor_nombre_comercial?: string;

  // Relación con Empresa
  @IsOptional()
  @IsNumber()
  empresa_id?: number; // Si no se proporciona, se usará la empresa activa

  // Campos contables
  @IsOptional()
  @IsString()
  observaciones_contables?: string;

  // Vendedor/Empleado
  @IsOptional()
  @IsNumber()
  vendedor_id?: number;

  // Punto de Venta
  @IsOptional()
  @IsNumber()
  punto_venta_id?: number;

  // Pagos de la factura
  @IsOptional()
  @IsArray()
  pagos?: Array<{
    codigo: string;
    monto: number;
    formaPago: string;
    metodoPago: string;
    tipoPago: string;
    banco_id?: number;
  }>;
}

