import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { AlbaranDetalle } from './albaran-detalle.entity';

@Entity('albaranes')
export class Albaran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numero: string; // ALB-2024-001

  @Column({ type: 'date' })
  fecha_recepcion: Date;

  @ManyToOne(() => OrdenCompra, { nullable: true })
  @JoinColumn({ name: 'orden_compra_id' })
  orden_compra: OrdenCompra;

  @Column({ nullable: true })
  orden_compra_id: number;

  @Column({ length: 50, default: 'PENDIENTE' })
  estado: string; // PENDIENTE, CONCILIADO, CON_DISCREPANCIAS

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ length: 100, nullable: true })
  usuario_recepcion: string;

  @OneToMany(() => AlbaranDetalle, (detalle) => detalle.albaran, { cascade: true })
  detalles: AlbaranDetalle[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
















