import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('cuentas_contables')
@Index(['codigo'], { unique: true })
export class CuentaContable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  codigo: string; // Ejemplo: "1.0.0", "1.1.0", "1.1.01"

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 50 })
  tipo: string; // ACTIVO, PASIVO, PATRIMONIO, INGRESO, EGRESO, COSTO

  @Column({ type: 'int', default: 1 })
  nivel: number; // 1 = nivel raíz, 2 = subnivel, etc.

  @ManyToOne(() => CuentaContable, (cuenta) => cuenta.hijos, { nullable: true })
  @JoinColumn({ name: 'padre_id' })
  padre: CuentaContable;

  @Column({ nullable: true })
  padre_id: number;

  @OneToMany(() => CuentaContable, (cuenta) => cuenta.padre)
  hijos: CuentaContable[];

  @Column({ default: true })
  activa: boolean; // Si la cuenta está activa

  @Column({ default: false })
  permite_movimiento: boolean; // Si permite movimientos directos (solo cuentas de último nivel)

  @Column({ type: 'enum', enum: ['DEUDORA', 'ACREEDORA'], default: 'DEUDORA' })
  naturaleza: string; // DEUDORA o ACREEDORA

  @Column({ length: 20, nullable: true })
  sri_codigo: string; // Código del formulario 101/102

  @Column({ default: false })
  requiere_auxiliar: boolean; // Obliga a ingresar un tercero (cliente/prov/empleado)

  @Column({ default: false })
  requiere_centro_costo: boolean; // Obliga a seleccionar centro de costos

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

