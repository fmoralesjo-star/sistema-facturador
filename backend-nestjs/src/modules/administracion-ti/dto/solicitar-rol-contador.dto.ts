import { IsNotEmpty, IsNumber } from 'class-validator';

export class SolicitarRolContadorDto {
  @IsNotEmpty()
  @IsNumber()
  usuario_id: number; // Usuario al que se le asignará el rol (puede ser el mismo Admin TI)

  @IsNotEmpty()
  @IsNumber()
  rol_contador_id: number; // ID del rol "Contador"
}










