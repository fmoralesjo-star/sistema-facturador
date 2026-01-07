import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('ordenes_compra_detalles')
export class OrdenCompraDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrdenCompra, (orden) => orden.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orden_compra_id' })
  orden_compra: OrdenCompra;

  @Column()
  orden_compra_id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @Column({ type: 'integer' })
  cantidad_pedida: number;

  @Column({ type: 'integer', default: 0 })
  cantidad_recibida: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_unitario: number;

  @CreateDateColumn()
  created_at: Date;
}
















