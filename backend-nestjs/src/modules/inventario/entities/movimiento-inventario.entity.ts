import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { Factura } from '../../facturas/entities/factura.entity';
import { PuntoVenta } from '../../puntos-venta/entities/punto-venta.entity';

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto, (producto) => producto.movimientos)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ length: 20 })
  tipo: string; // ENTRADA, SALIDA, AJUSTE

  @Column({ type: 'integer' })
  cantidad: number;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Factura, { nullable: true })
  @JoinColumn({ name: 'factura_id' })
  factura: Factura;

  @Column({ nullable: true })
  factura_id: number;

  @Column({ nullable: true })
  compra_id: number;

  @ManyToOne(() => PuntoVenta)
  @JoinColumn({ name: 'punto_venta_id' })
  puntoVenta: PuntoVenta;

  @Column({ nullable: true })
  punto_venta_id: number; // ID del punto de venta donde ocurrió el movimiento

  @CreateDateColumn()
  created_at: Date;
}


















