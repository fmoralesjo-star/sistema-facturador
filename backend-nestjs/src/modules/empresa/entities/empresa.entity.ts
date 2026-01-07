import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Tabla: users_companies
 * Propósito: Datos del emisor (RUC, Razón Social, Dirección, Obligado a llevar contabilidad)
 */
@Entity('users_companies')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 13 })
  ruc: string; // RUC del emisor (13 dígitos en Ecuador)

  @Column({ length: 255 })
  razon_social: string; // Razón social de la empresa

  @Column({ length: 255, nullable: true })
  nombre_comercial: string; // Nombre comercial (opcional)

  @Column({ type: 'text' })
  direccion_matriz: string; // Dirección matriz

  @Column({ type: 'text', nullable: true })
  direccion_establecimiento: string; // Dirección del establecimiento

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  contribuyente_especial: string; // Número de resolución si es contribuyente especial

  @Column({ default: false })
  obligado_contabilidad: boolean; // Obligado a llevar contabilidad

  @Column({ length: 3, default: '001' })
  codigo_establecimiento: string; // Código del establecimiento (001, 002, etc.)

  @Column({ length: 255, nullable: true })
  punto_emision: string; // Punto de emisión (puede ser una descripción)

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'date', nullable: true })
  fecha_cierre_contable: Date; // Fecha hasta la cual la contabilidad está cerrada

  @Column({ default: true })
  activa: boolean; // Si la empresa está activa

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
















