import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Asistencia } from './asistencia.entity';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 255, nullable: true })
  apellido: string;

  @Column({ length: 50, nullable: true })
  identificacion: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ type: 'date', nullable: true })
  fecha_ingreso: Date;

  @Column({ length: 20, default: 'activo' })
  estado: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 460.00 })
  sueldo: number;

  @OneToMany(() => Asistencia, (asistencia) => asistencia.empleado)
  asistencias: Asistencia[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
