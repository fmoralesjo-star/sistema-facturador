import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class Verificar2FADto {
  @IsNotEmpty()
  @IsNumber()
  autorizacion_id: number;

  @IsNotEmpty()
  @IsString()
  codigo_verificacion: string;
}










