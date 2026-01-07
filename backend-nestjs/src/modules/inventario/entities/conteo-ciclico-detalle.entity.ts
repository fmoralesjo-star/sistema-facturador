import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ConteoCiclico } from './conteo-ciclico.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('conteos_ciclicos_detalles')
export class ConteoCiclicoDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ConteoCiclico, (conteo) => conteo.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conteo_id' })
  conteo: ConteoCiclico;

  @Column()
  conteo_id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @Column({ type: 'integer' })
  cantidad_sistema: number; // Stock según el sistema

  @Column({ type: 'integer', nullable: true })
  cantidad_fisica: number; // Stock contado físicamente

  @Column({ type: 'integer', nullable: true })
  diferencia: number; // cantidad_fisica - cantidad_sistema

  @Column({ length: 50, default: 'PENDIENTE' })
  estado: string; // PENDIENTE, CONTADO, DISCREPANCIA

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  created_at: Date;
}
















