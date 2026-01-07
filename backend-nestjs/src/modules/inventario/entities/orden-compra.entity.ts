import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrdenCompraDetalle } from './orden-compra-detalle.entity';
import { Albaran } from './albaran.entity';

@Entity('ordenes_compra')
export class OrdenCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numero: string; // OC-2024-001

  @Column({ type: 'date' })
  fecha_orden: Date;

  @Column({ type: 'date', nullable: true })
  fecha_esperada: Date;

  @Column({ length: 100, nullable: true })
  proveedor: string;

  @Column({ length: 50, default: 'PENDIENTE' })
  estado: string; // PENDIENTE, PARCIAL, COMPLETA, CANCELADA

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @OneToMany(() => OrdenCompraDetalle, (detalle) => detalle.orden_compra, { cascade: true })
  detalles: OrdenCompraDetalle[];

  @OneToMany(() => Albaran, (albaran) => albaran.orden_compra)
  albaranes: Albaran[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
















