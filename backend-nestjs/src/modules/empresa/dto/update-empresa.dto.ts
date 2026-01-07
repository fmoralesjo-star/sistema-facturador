import { IsOptional, IsString, IsBoolean, IsEmail, Length } from 'class-validator';

// DTO para actualizar empresa - todos los campos son opcionales
export class UpdateEmpresaDto {
  @IsOptional()
  @IsString()
  @Length(13, 13)
  ruc?: string;

  @IsOptional()
  @IsString()
  razon_social?: string;

  @IsOptional()
  @IsString()
  nombre_comercial?: string;

  @IsOptional()
  @IsString()
  direccion_matriz?: string;

  // Alias para compatibilidad con frontend
  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  direccion_establecimiento?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  contribuyente_especial?: string;

  @IsOptional()
  @IsBoolean()
  obligado_contabilidad?: boolean;

  @IsOptional()
  @IsString()
  codigo_establecimiento?: string;

  @IsOptional()
  @IsString()
  punto_emision?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

