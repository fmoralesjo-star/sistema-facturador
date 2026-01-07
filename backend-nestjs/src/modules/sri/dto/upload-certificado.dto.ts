import { IsNotEmpty, IsString } from 'class-validator';

export class UploadCertificadoDto {
  @IsNotEmpty()
  @IsString()
  ruc: string;

  @IsNotEmpty()
  @IsString()
  password: string; // Se encriptará antes de guardar
}

