import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { FacturaDetalle } from '../../facturas/entities/factura-detalle.entity';
import { MovimientoInventario } from '../../inventario/entities/movimiento-inventario.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  empresa_id: number; // Multi-tenancy


  @Column({ length: 50, nullable: true })
  num_movimiento: string; // Número de movimiento

  @Column({ type: 'date', nullable: true })
  fecha_movimiento: Date; // Fecha de movimiento

  @Column({ unique: true, length: 100 })
  codigo: string;

  @Column({ length: 100, nullable: true })
  grupo_comercial: string; // Grupo comercial

  @Column({ length: 100, nullable: true })
  referencia: string; // Referencia del producto

  @Column({ unique: true, length: 100, nullable: true })
  sku: string; // Stock Keeping Unit - Identificador único a nivel de producto/variante

  @Column({ length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 100, nullable: true })
  coleccion: string; // Colección

  @Column({ length: 100, nullable: true })
  categoria: string; // Categoría

  @Column({ length: 50, nullable: true })
  talla: string; // Talla del producto

  @Column({ length: 50, nullable: true })
  color: string; // Código de color

  @Column({ length: 100, nullable: true })
  desc_color: string; // Descripción del color

  @Column({ length: 50, nullable: true })
  cod_barras: string; // Código de barras (máximo 50 caracteres)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_costo: number; // Precio de costo

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number; // Precio público (precio de venta)

  @Column({ length: 20, nullable: true })
  unidad: string; // Unidad de medida (PZA, KG, L, etc.)

  @Column({ type: 'integer', default: 0 })
  stock: number;

  /**
   * Tipo de impuesto: '0' (IVA 0%), '15' (IVA 15%), 'EXENTO' (Exento de IVA)
   */
  @Column({ length: 10, default: '15' })
  tipo_impuesto: string; // '0', '15', 'EXENTO'

  @Column({ type: 'integer', nullable: true })
  punto_reorden: number; // Punto de reorden: alerta cuando stock baja de este valor

  @Column({ type: 'integer', nullable: true })
  stock_seguridad: number; // Stock de seguridad: colchón extra para evitar quiebres

  @Column({ type: 'integer', nullable: true })
  tiempo_entrega_dias: number; // Tiempo de entrega del proveedor en días

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costo_promedio: number; // Costo promedio para valoración (se actualiza con FIFO)

  @Column({ default: true })
  activo: boolean; // Si el producto está activo

  @OneToMany(() => FacturaDetalle, (detalle) => detalle.producto)
  detallesFactura: FacturaDetalle[];

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.producto)
  movimientos: MovimientoInventario[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deleted_at: Date;
}

