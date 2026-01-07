export interface PartidaDto {
  cuenta_id: number;
  debe: number;
  haber: number;
  descripcion?: string;
}

export class CreateAsientoDto {
  fecha: Date;
  descripcion: string;
  tipo?: string;
  factura_id?: number;
  partidas: PartidaDto[];
}


















