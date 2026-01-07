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
import { Ubicacion } from './ubicacion.entity';

/**
 * Relación entre Productos y Ubicaciones
 * Permite tener stock del mismo producto en diferentes ubicaciones
 */
@Entity('productos_ubicaciones')
@Index(['producto_id', 'ubicacion_id'], { unique: true })
export class ProductoUbicacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @ManyToOne(() => Ubicacion, (ubicacion) => ubicacion.productosUbicacion)
  @JoinColumn({ name: 'ubicacion_id' })
  ubicacion: Ubicacion;

  @Column()
  ubicacion_id: number;

  @Column({ type: 'integer', default: 0 })
  stock: number; // Stock del producto en esta ubicación específica

  @Column({ type: 'integer', nullable: true })
  stock_minimo: number; // Stock mínimo para esta ubicación

  @Column({ type: 'integer', nullable: true })
  stock_maximo: number; // Stock máximo para esta ubicación

  @Column({ length: 20, default: 'DISPONIBLE' })
  estado_stock: string; // DISPONIBLE, RESERVADO, DANADO_MERMA, EN_TRANSITO

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

