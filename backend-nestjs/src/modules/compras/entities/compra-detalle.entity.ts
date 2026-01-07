import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Compra } from './compra.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('compra_detalles')
export class CompraDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Compra, (compra) => compra.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'compra_id' })
  compra: Compra;

  @Column()
  compra_id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;
}












