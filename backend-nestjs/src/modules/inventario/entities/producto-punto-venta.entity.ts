import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { PuntoVenta } from '../../puntos-venta/entities/punto-venta.entity';

/**
 * Relación entre Productos y Puntos de Venta
 * Permite tener stock del mismo producto en diferentes puntos de venta
 */
@Entity('productos_puntos_venta')
@Index(['producto_id', 'punto_venta_id'], { unique: true })
export class ProductoPuntoVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @ManyToOne(() => PuntoVenta, (puntoVenta) => puntoVenta.stocks)
  @JoinColumn({ name: 'punto_venta_id' })
  puntoVenta: PuntoVenta;

  @Column({ type: 'integer' })
  punto_venta_id: number; // ID del punto de venta (1, 2, 3)

  @Column({ type: 'integer', default: 0 })
  stock: number; // Stock del producto en este punto de venta específico

  @Column({ type: 'integer', nullable: true })
  stock_minimo: number; // Stock mínimo para este punto de venta

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}











