import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CompraDetalle } from './compra-detalle.entity';
import { Proveedor } from './proveedor.entity';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numero: string;

  @Column({ length: 49, nullable: true })
  autorizacion: string; // Clave de acceso o número de autorización SRI


  @ManyToOne(() => Proveedor, { nullable: true })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @Column({ nullable: true })
  proveedor_id: number;

  @Column({ nullable: true })
  punto_venta_id: number; // ID del punto de venta donde se recibió la compra

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'date', nullable: true })
  fecha_vencimiento: Date;

  @Column({ length: 4, nullable: true })
  sustento_tributario: string;

  @Column({ length: 50, nullable: true, default: 'ADMINISTRACION' })
  centro_costo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  base_0: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  base_12: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  base_no_objeto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  base_exenta: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  impuesto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 20, default: 'Contado', nullable: true })
  forma_pago: string; // 'Contado' | 'Credito'

  @Column({ length: 20, default: 'PENDIENTE' })
  estado: string; // 'PENDIENTE' | 'PAGADA' | 'ANULADA'

  @Column({ default: false })
  asiento_contable_creado: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Campos para Retenciones (Motor de Impuestos)
  @Column({ length: 10, nullable: true })
  retencion_renta_codigo: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  retencion_renta_porcentaje: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  retencion_renta_valor: number;

  @Column({ length: 10, nullable: true })
  retencion_iva_codigo: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  retencion_iva_porcentaje: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  retencion_iva_valor: number;

  @OneToMany(() => CompraDetalle, (detalle) => detalle.compra, { cascade: true })
  detalles: CompraDetalle[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


