export class CreateTransferenciaDto {
  tipo: 'producto' | 'dinero';
  producto_id?: number;
  cantidad?: number;

  origen_id?: number;
  destino_id?: number;

  origen?: string; // DEPRECATED or used for display
  destino?: string; // DEPRECATED or used for display

  motivo?: string;
  fecha: Date;
  monto?: number;
  cuenta_origen?: string;
  cuenta_destino?: string;
  referencia?: string;
  estado?: string;
}












