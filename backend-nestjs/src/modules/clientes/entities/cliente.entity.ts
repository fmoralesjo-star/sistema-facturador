import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Factura } from '../../facturas/entities/factura.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  empresa_id: number; // Multi-tenancy


  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 50, unique: true, nullable: true })
  ruc: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento: Date;

  @Column({ type: 'boolean', default: false, nullable: true })
  esExtranjero: boolean;

  @OneToMany(() => Factura, (factura) => factura.cliente)
  facturas: Factura[];

  // Campos CRM adicionales
  @Column({ type: 'text', nullable: true })
  notas: string; // Notas internas sobre el cliente

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  limite_credito: number; // Límite de crédito asignado

  @Column({ length: 20, nullable: true, default: 'REGULAR' })
  tipo_cliente: string; // REGULAR, VIP, MAYORISTA

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  total_compras_historico: number; // Total acumulado de compras

  @Column({ type: 'int', nullable: true, default: 0 })
  cantidad_compras: number; // Número total de facturas

  @Column({ type: 'date', nullable: true })
  ultima_compra: Date; // Fecha de la última compra

  @CreateDateColumn()
  created_at: Date;

  // ============================================================
  // NUEVOS CAMPOS SOLICITADOS (Variable Integration)
  // ============================================================

  // Identificación Extendida
  @Column({ length: 20, nullable: true, default: 'NATURAL' })
  tipo_persona: string; // NATURAL, JURIDICA

  @Column({ length: 255, nullable: true })
  razon_social: string;

  @Column({ length: 255, nullable: true })
  nombre_comercial: string;

  @Column({ length: 50, nullable: true })
  contribuyente_especial: string; // N/A, '534', etc.

  // Relaciones y Categorización
  @Column({ length: 255, nullable: true })
  persona_relacionada: string;

  @Column({ length: 100, nullable: true })
  categoria_persona: string;

  @Column({ length: 255, nullable: true })
  vendedor_asignado: string;

  // Roles (Booleanos)
  @Column({ type: 'boolean', default: true })
  es_cliente: boolean;

  @Column({ type: 'boolean', default: false })
  es_proveedor: boolean;

  @Column({ type: 'boolean', default: false })
  es_vendedor: boolean;

  @Column({ type: 'boolean', default: false })
  es_empleado: boolean;

  @Column({ type: 'boolean', default: false })
  es_artesano: boolean;

  @Column({ type: 'boolean', default: false })
  para_exportacion: boolean;

  // Contabilidad Cliente/Proveedor
  @Column({ length: 50, nullable: true })
  centro_costo_cliente: string;

  @Column({ length: 50, nullable: true })
  cuenta_por_cobrar: string;

  @Column({ length: 50, nullable: true })
  centro_costo_proveedor: string;

  @Column({ length: 50, nullable: true })
  cuenta_por_pagar: string;

  // Condiciones Comerciales
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  descuento_porcentaje: number;

  @Column({ type: 'int', default: 0 })
  dias_credito: number;

  @Column({ length: 50, nullable: true })
  pvp_por_defecto: string;

  // Datos Bancarios
  @Column({ length: 100, nullable: true })
  banco_nombre: string;

  @Column({ length: 50, nullable: true })
  cuenta_bancaria_numero: string;

  @Column({ length: 20, nullable: true })
  cuenta_bancaria_tipo: string; // AHORROS, CORRIENTE

  // Recursos Humanos (Si es empleado)
  @Column({ length: 100, nullable: true })
  departamento: string;

  @Column({ length: 100, nullable: true })
  cargo: string;

  @Column({ length: 50, nullable: true })
  grupo_empleado: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sueldo: number;

  @Column({ length: 50, nullable: true })
  tiempo_trabajo: string;

  @Column({ type: 'date', nullable: true })
  fecha_ultimo_ingreso: Date;

  @Column({ type: 'date', nullable: true })
  fecha_ultima_salida: Date;

  @Column({ type: 'int', default: 0 })
  numero_cargas: number;

  @Column({ type: 'int', default: 0 })
  vacaciones_tomadas: number;

  @Column({ length: 50, nullable: true })
  centro_costo_rrhh: string;

  @Column({ length: 50, nullable: true })
  tipo_contrato: string;


  @UpdateDateColumn()
  updated_at: Date;
}







