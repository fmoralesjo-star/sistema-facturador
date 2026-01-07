import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Albaran } from './albaran.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('albaranes_detalles')
export class AlbaranDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Albaran, (albaran) => albaran.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'albaran_id' })
  albaran: Albaran;

  @Column()
  albaran_id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @Column({ type: 'integer' })
  cantidad_esperada: number;

  @Column({ type: 'integer' })
  cantidad_recibida: number;

  @Column({ type: 'integer', default: 0 })
  cantidad_faltante: number;

  @Column({ type: 'integer', default: 0 })
  cantidad_danada: number;

  @Column({ length: 50, default: 'OK' })
  estado: string; // OK, FALTANTE, DANADO, DISCREPANCIA

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  created_at: Date;
}
















