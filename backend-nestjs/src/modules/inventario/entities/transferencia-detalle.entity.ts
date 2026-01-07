import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Transferencia } from './transferencia.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('transferencias_detalles')
export class TransferenciaDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transferencia, (transferencia) => transferencia.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transferencia_id' })
  transferencia: Transferencia;

  @Column()
  transferencia_id: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  producto_id: number;

  @Column({ type: 'integer' })
  cantidad: number;

  @Column({ type: 'integer', default: 0 })
  cantidad_recibida: number;

  @CreateDateColumn()
  created_at: Date;
}
















