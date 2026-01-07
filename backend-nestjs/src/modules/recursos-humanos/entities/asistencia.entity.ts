import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Empleado } from './empleado.entity';

@Entity('asistencias')
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Empleado, (empleado) => empleado.asistencias)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @Column()
  empleado_id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time', nullable: true })
  hora_entrada: string;

  @Column({ type: 'time', nullable: true })
  hora_salida: string;

  @Column({ length: 20, default: 'normal' })
  tipo: string; // 'normal' | 'permiso' | 'vacacion' | 'ausencia'

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  created_at: Date;
}












