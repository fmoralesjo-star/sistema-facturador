import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('ajustes_inventario')
export class AjusteInventario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numero: string; // AJU-2024-001

  @Column({ type: 'date' })
  fecha: Date;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @Column({ type: 'integer' })
  cantidad_anterior: number;

  @Column({ type: 'integer' })
  cantidad_nueva: number;

  @Column({ type: 'integer' })
  diferencia: number; // cantidad_nueva - cantidad_anterior

  @Column({ length: 50 })
  motivo: string; // ROBO, ERROR_CONTEO, DANO, PERDIDA, OTRO

  @Column({ type: 'text', nullable: true })
  motivo_detalle: string;

  @Column({ length: 100 })
  usuario_responsable: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  created_at: Date;
}

