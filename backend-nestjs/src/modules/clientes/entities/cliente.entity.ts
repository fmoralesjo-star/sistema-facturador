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

  @UpdateDateColumn()
  updated_at: Date;
}







