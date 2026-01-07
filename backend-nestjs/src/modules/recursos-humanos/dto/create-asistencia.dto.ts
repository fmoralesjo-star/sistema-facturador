export class CreateAsistenciaDto {
  empleado_id: number;
  fecha: Date;
  hora_entrada?: string;
  hora_salida?: string;
  tipo: 'normal' | 'permiso' | 'vacacion' | 'ausencia';
  observaciones?: string;
}












