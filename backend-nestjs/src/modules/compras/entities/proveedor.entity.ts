import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: true })
  codigo: string;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 20, nullable: true })
  ruc: string;

  @Column({ length: 50, nullable: true, default: 'OTROS' })
  tipo_contribuyente: string; // PERSONA_NATURAL, SOCIEDAD, CONTRIBUTYENTE_ESPECIAL, RIMPE_EMPRENDEDOR, RIMPE_NEGOCIO_POPULAR

  @Column({ default: false })
  obligado_contabilidad: boolean;

  @Column({ default: false })
  es_parte_relacionada: boolean;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 100, nullable: true })
  ciudad: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ length: 20, default: 'activo' })
  estado: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}












