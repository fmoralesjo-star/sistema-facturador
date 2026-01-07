import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Picking } from './picking.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { Ubicacion } from './ubicacion.entity';

@Entity('pickings_detalles')
export class PickingDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Picking, (picking) => picking.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'picking_id' })
  picking: Picking;

  @Column()
  picking_id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @ManyToOne(() => Ubicacion, { nullable: true })
  @JoinColumn({ name: 'ubicacion_id' })
  ubicacion: Ubicacion;

  @Column({ nullable: true })
  ubicacion_id: number;

  @Column({ type: 'integer' })
  cantidad_solicitada: number;

  @Column({ type: 'integer', default: 0 })
  cantidad_picked: number;

  @Column({ length: 50, default: 'PENDIENTE' })
  estado: string; // PENDIENTE, PICKED, FALTANTE

  @Column({ type: 'integer', nullable: true })
  orden_picking: number; // Orden sugerido para optimizar la ruta

  @CreateDateColumn()
  created_at: Date;
}
















