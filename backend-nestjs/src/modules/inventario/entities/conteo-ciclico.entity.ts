import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConteoCiclicoDetalle } from './conteo-ciclico-detalle.entity';

@Entity('conteos_ciclicos')
export class ConteoCiclico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numero: string; // CONT-2024-001

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ length: 100, nullable: true })
  categoria: string; // Categoría de productos a contar

  @Column({ length: 100, nullable: true })
  ubicacion: string; // Ubicación específica a contar

  @Column({ length: 50, default: 'PENDIENTE' })
  estado: string; // PENDIENTE, EN_PROCESO, COMPLETADO, CANCELADO

  @Column({ length: 100, nullable: true })
  usuario_responsable: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_inicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_completado: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @OneToMany(() => ConteoCiclicoDetalle, (detalle) => detalle.conteo, { cascade: true })
  detalles: ConteoCiclicoDetalle[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
















