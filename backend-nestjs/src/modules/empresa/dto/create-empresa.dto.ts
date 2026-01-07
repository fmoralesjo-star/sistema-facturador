import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(13)
  @MaxLength(13)
  ruc: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  razon_social: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  nombre_comercial?: string;

  @IsString()
  @IsNotEmpty()
  direccion_matriz: string;

  @IsString()
  @IsOptional()
  direccion_establecimiento?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  telefono?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  contribuyente_especial?: string;

  @IsBoolean()
  @IsOptional()
  obligado_contabilidad?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  codigo_establecimiento?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  punto_emision?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}


















