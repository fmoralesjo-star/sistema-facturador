import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('promociones')
export class Promocion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 50 })
  tipo: string; // 'descuento_porcentaje' | 'descuento_fijo' | 'compra_x_lleva_y' | 'envio_gratis'

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valor: number;

  @ManyToOne(() => Producto, { nullable: true })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ nullable: true })
  producto_id: number;

  @Column({ length: 255, nullable: true })
  categoria: string;

  @Column({ type: 'timestamp' })
  fecha_inicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_fin: Date;

  @Column({ type: 'time', nullable: true })
  hora_inicio: string;

  @Column({ type: 'time', nullable: true })
  hora_fin: string;

  @Column({ type: 'text', nullable: true })
  dias_semana: string; // JSON array

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimo_compra: number;

  @Column({ type: 'integer', nullable: true })
  maximo_usos: number;

  @Column({ type: 'integer', default: 0 })
  usos_actuales: number;

  @Column({ length: 20, default: 'activa' })
  estado: string; // 'activa' | 'inactiva'

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}












