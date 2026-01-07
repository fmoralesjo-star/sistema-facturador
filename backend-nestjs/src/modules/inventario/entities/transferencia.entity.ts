import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransferenciaDetalle } from './transferencia-detalle.entity';
import { PuntoVenta } from '../../puntos-venta/entities/punto-venta.entity';

@Entity('transferencias')
export class Transferencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numero: string; // TRANS-2024-001

  @Column({ type: 'date' })
  fecha: Date;

  @ManyToOne(() => PuntoVenta)
  @JoinColumn({ name: 'origen_id' })
  origenPuntoVenta: PuntoVenta;

  @Column({ nullable: true })
  origen_id: number;

  @Column({ length: 100, nullable: true })
  origen: string; // DEPRECATED: Tienda/Bodega origen

  @ManyToOne(() => PuntoVenta)
  @JoinColumn({ name: 'destino_id' })
  destinoPuntoVenta: PuntoVenta;

  @Column({ nullable: true })
  destino_id: number;

  @Column({ length: 100, nullable: true })
  destino: string; // DEPRECATED: Tienda/Bodega destino

  @Column({ length: 50, default: 'PENDIENTE' })
  estado: string; // PENDIENTE, EN_TRANSITO, RECIBIDA, CANCELADA

  @Column({ length: 100, nullable: true })
  usuario_envio: string;

  @Column({ length: 100, nullable: true })
  usuario_recepcion: string;

  @Column({ type: 'date', nullable: true })
  fecha_envio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_recepcion: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @OneToMany(() => TransferenciaDetalle, (detalle) => detalle.transferencia, { cascade: true })
  detalles: TransferenciaDetalle[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
















