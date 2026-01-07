import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

/**
 * Entidad para tracking FIFO/PEPS (First In First Out)
 * Permite rastrear lotes de productos para valoración correcta
 */
@Entity('lotes_inventario')
@Index(['producto_id', 'fecha_entrada'])
export class LoteInventario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @Column({ length: 100, nullable: true })
  numero_lote: string; // Número de lote o lote del proveedor

  @Column({ type: 'date' })
  fecha_entrada: Date; // Fecha de entrada al inventario (para FIFO)

  @Column({ type: 'date', nullable: true })
  fecha_vencimiento: Date; // Para productos perecederos

  @Column({ type: 'integer' })
  cantidad_inicial: number; // Cantidad inicial del lote

  @Column({ type: 'integer' })
  cantidad_disponible: number; // Cantidad disponible (se reduce al vender)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costo_unitario: number; // Costo de compra por unidad

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_venta: number; // Precio de venta

  @Column({ length: 100, nullable: true })
  proveedor: string;

  @Column({ length: 50, nullable: true })
  referencia_compra: string; // Orden de compra o albarán

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  created_at: Date;
}
















