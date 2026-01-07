import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConciliacionBancaria } from '../../conciliaciones/entities/conciliacion-bancaria.entity';

@Entity('bancos')
export class Banco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 50, nullable: true })
  codigo: string;

  @Column({ length: 20, nullable: true })
  numero_cuenta: string;

  @Column({ length: 50, nullable: true })
  tipo_cuenta: string; // Ahorros, Corriente, etc.

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldo_inicial: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldo_actual: number;

  @Column({ length: 200, nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => ConciliacionBancaria, (conciliacion) => conciliacion.banco)
  conciliaciones: ConciliacionBancaria[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}












