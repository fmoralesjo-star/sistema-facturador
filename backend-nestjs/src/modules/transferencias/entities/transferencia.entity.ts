import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('transferencias')
export class Transferencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  tipo: string; // 'producto' | 'dinero'

  @ManyToOne(() => Producto, { nullable: true })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ nullable: true })
  producto_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cantidad: number;

  @Column({ length: 255 })
  origen: string;

  @Column({ length: 255 })
  destino: string;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monto: number;

  @Column({ length: 255, nullable: true })
  cuenta_origen: string;

  @Column({ length: 255, nullable: true })
  cuenta_destino: string;

  @Column({ length: 255, nullable: true })
  referencia: string;

  @Column({ length: 20, default: 'pendiente' })
  estado: string; // 'pendiente' | 'en_transito' | 'completada'

  @CreateDateColumn()
  created_at: Date;
}












