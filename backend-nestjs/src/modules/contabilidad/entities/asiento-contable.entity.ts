import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Factura } from '../../facturas/entities/factura.entity';
import { PartidaContable } from './partida-contable.entity';

@Entity('asientos_contables')
@Index(['numero_asiento'], { unique: true })
export class AsientoContable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numero_asiento: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ length: 20, nullable: true })
  tipo: string; // VENTA, COSTO, ACTIVO, PASIVO, INGRESO, EGRESO (opcional, para clasificación)

  // Totales del asiento (calculados automáticamente)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_debe: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_haber: number;

  // Relación con factura (opcional, para rastrear origen)
  @ManyToOne(() => Factura, { nullable: true })
  @JoinColumn({ name: 'factura_id' })
  factura: any;

  @Column({ nullable: true })
  factura_id: number;

  @Column({ length: 50, nullable: true })
  origen_modulo: string; // FACTURACION, COMPRAS, RECURSOS_HUMANOS, BANCOS

  @Column({ nullable: true })
  origen_id: number; // ID del registro en el módulo de origen

  @Column({ length: 20, default: 'ACTIVO' })
  estado: string; // BORRADOR, ACTIVO, ANULADO

  // Partidas del asiento (detalles con cuentas)
  @OneToMany(() => PartidaContable, (partida) => partida.asiento, {
    cascade: true,
    eager: false,
  })
  partidas: any[];

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deleted_at: Date;
}
