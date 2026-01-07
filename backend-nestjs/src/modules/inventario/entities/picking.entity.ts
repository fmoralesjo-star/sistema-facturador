import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PickingDetalle } from './picking-detalle.entity';

@Entity('pickings')
export class Picking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numero: string; // PICK-2024-001

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ length: 50, nullable: true })
  orden_venta: string; // Número de orden de venta o factura

  @Column({ length: 50, default: 'PENDIENTE' })
  estado: string; // PENDIENTE, EN_PROCESO, COMPLETADO, CANCELADO

  @Column({ length: 100, nullable: true })
  operario: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_inicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_completado: Date;

  @OneToMany(() => PickingDetalle, (detalle) => detalle.picking, { cascade: true })
  detalles: PickingDetalle[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
















