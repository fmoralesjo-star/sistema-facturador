import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateBancoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  @IsOptional()
  numero_cuenta?: string;

  @IsString()
  @IsOptional()
  tipo_cuenta?: string;

  @IsNumber()
  @IsOptional()
  saldo_inicial?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}












