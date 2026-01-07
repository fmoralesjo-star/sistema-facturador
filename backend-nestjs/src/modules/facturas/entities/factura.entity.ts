import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { FacturaDetalle } from './factura-detalle.entity';
import { AsientoContable } from '../../contabilidad/entities/asiento-contable.entity';
import { Empresa } from '../../empresa/entities/empresa.entity';
import { Empleado } from '../../recursos-humanos/entities/empleado.entity';
import { Voucher } from './voucher.entity';

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numero: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.facturas)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column()
  cliente_id: number;

  // Relación con Empresa (users_companies)
  @ManyToOne(() => Empresa, { nullable: true })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ nullable: true })
  empresa_id: number;

  // Relación con Empleado/Vendedor
  @ManyToOne(() => Empleado, { nullable: true })
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: Empleado;

  @Column({ nullable: true })
  vendedor_id: number;

  @Column({ nullable: true })
  punto_venta_id: number; // ID del punto de venta donde se emitió la factura

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  impuesto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 20, default: 'PENDIENTE' })
  estado: string;

  // Campos SRI
  @Column({ length: 3, default: '001' })
  establecimiento: string;

  @Column({ length: 3, default: '001' })
  punto_emision: string;

  @Column({ length: 9, nullable: true })
  secuencial: string;

  @Column({ length: 2, default: '01' })
  tipo_comprobante: string;

  @Column({ length: 1, default: '2' })
  ambiente: string;

  @Column({ length: 49, nullable: true })
  clave_acceso: string;

  @Column({ length: 100, nullable: true })
  autorizacion: string;

  @Column({ type: 'date', nullable: true })
  fecha_autorizacion: Date;

  @Column({ type: 'text', nullable: true })
  xml_autorizado: string;

  @Column({ length: 100, default: 'SIN UTILIZACION DEL SISTEMA FINANCIERO' })
  forma_pago: string;

  @Column({ length: 20, default: 'CONTADO' })
  condicion_pago: string;

  // Campos para Retenciones Recibidas
  @Column({ length: 50, nullable: true })
  retencion_numero: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  retencion_valor_ir: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  retencion_valor_iva: number;

  @Column({ type: 'date', nullable: true })
  retencion_fecha: Date;

  // Información del emisor
  @Column({ length: 50, nullable: true })
  emisor_ruc: string;

  @Column({ length: 255, nullable: true })
  emisor_razon_social: string;

  @Column({ length: 255, nullable: true })
  emisor_nombre_comercial: string;

  @Column({ type: 'text', nullable: true })
  emisor_direccion_matriz: string;

  @Column({ type: 'text', nullable: true })
  emisor_direccion_establecimiento: string;

  @Column({ length: 50, nullable: true })
  emisor_telefono: string;

  @Column({ length: 255, nullable: true })
  emisor_email: string;

  // Información adicional del cliente
  @Column({ type: 'text', nullable: true })
  cliente_direccion: string;

  @Column({ length: 50, nullable: true })
  cliente_telefono: string;

  @Column({ length: 255, nullable: true })
  cliente_email: string;

  // Estado SRI
  @Column({ length: 50, nullable: true })
  estado_sri: string;

  @Column({ type: 'text', nullable: true })
  mensaje_sri: string;

  @OneToMany(() => FacturaDetalle, (detalle) => detalle.factura, { cascade: true })
  detalles: FacturaDetalle[];

  @OneToMany(() => AsientoContable, (asiento) => asiento.factura)
  asientos: any[];

  // Relación con Voucher (1:1)
  @OneToMany(() => Voucher, (voucher) => voucher.factura)
  vouchers: Voucher[];

  // Campos contables adicionales
  @Column({ type: 'boolean', default: false })
  asiento_contable_creado: boolean; // Indica si ya se creó el asiento contable

  @Column({ length: 50, nullable: true })
  numero_asiento_contable: string; // Número del asiento contable relacionado

  @Column({ type: 'text', nullable: true })
  observaciones_contables: string; // Observaciones para contabilidad

  // Campos adicionales para el RIDE (JSON: [{nombre: 'Vendedor', valor: 'Juan'}])
  @Column({ type: 'simple-json', nullable: true })
  info_adicional: { nombre: string; valor: string }[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deleted_at: Date;
}
