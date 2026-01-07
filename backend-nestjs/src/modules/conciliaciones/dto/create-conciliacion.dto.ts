import { IsNumber, IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateConciliacionDto {
  @IsNumber()
  banco_id: number;

  @IsNumber()
  @IsOptional()
  factura_id?: number;

  @IsDateString()
  fecha: string;

  @IsDateString()
  @IsOptional()
  fecha_valor?: string;

  @IsString()
  @IsOptional()
  referencia?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  monto: number;

  @IsString()
  tipo: string;

  @IsString()
  @IsOptional()
  forma_pago?: string;

  @IsString()
  @IsOptional()
  metodo_pago?: string;

  @IsBoolean()
  @IsOptional()
  conciliado?: boolean;

  @IsString()
  @IsOptional()
  observaciones?: string;
}












