import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { AsientoContable } from './asiento-contable.entity';
import { CuentaContable } from './cuenta-contable.entity';

/**
 * Representa una partida individual dentro de un asiento contable
 * Cada partida tiene una cuenta, un debe o un haber, y pertenece a un asiento
 * La suma de debe debe igualar la suma de haber en un asiento (Partida Doble)
 */
@Entity('partidas_contables')
export class PartidaContable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AsientoContable, (asiento) => asiento.partidas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'asiento_id' })
  asiento: any;

  @Column()
  asiento_id: number;

  @ManyToOne(() => CuentaContable)
  @JoinColumn({ name: 'cuenta_id' })
  cuenta: CuentaContable;

  @Column()
  cuenta_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  debe: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  haber: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'tercero_id', nullable: true })
  tercero_id: number; // ID del Cliente, Proveedor o Empleado

  @Column({ name: 'tercero_tipo', length: 20, nullable: true })
  tercero_tipo: string; // 'CLIENTE', 'PROVEEDOR', 'EMPLEADO'

  @Column({ name: 'centro_costo_id', nullable: true })
  centro_costo_id: number; // Para cuentas de ingresos/gastos

  @Column({ name: 'sri_sustento_id', nullable: true })
  sri_sustento_id: string; // Código de sustento tributario (01, 02, etc) para compras

  @CreateDateColumn()
  created_at: Date;
}
















