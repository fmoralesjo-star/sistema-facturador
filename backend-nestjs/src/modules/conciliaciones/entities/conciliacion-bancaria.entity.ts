import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Banco } from '../../bancos/entities/banco.entity';
import { Factura } from '../../facturas/entities/factura.entity';

@Entity('conciliaciones_bancarias')
export class ConciliacionBancaria {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Banco)
  @JoinColumn({ name: 'banco_id' })
  banco: Banco;

  @Column()
  banco_id: number;

  @ManyToOne(() => Factura, { nullable: true })
  @JoinColumn({ name: 'factura_id' })
  factura: Factura;

  @Column({ nullable: true })
  factura_id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'date', nullable: true })
  fecha_valor: Date;

  @Column({ length: 200, nullable: true })
  referencia: string;

  @Column({ length: 500, nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monto: number;

  @Column({ length: 20 })
  tipo: string; // DEPOSITO, RETIRO, TRANSFERENCIA, CHEQUE, TARJETA, etc.

  @Column({ length: 50, nullable: true })
  forma_pago: string; // Código SRI de forma de pago

  @Column({ length: 50, nullable: true })
  metodo_pago: string; // EFECTIVO, TARJETA, TRANSFERENCIA, etc.

  @Column({ default: false })
  conciliado: boolean;

  @Column({ type: 'date', nullable: true })
  fecha_conciliacion: Date;

  @Column({ length: 500, nullable: true })
  observaciones: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}












