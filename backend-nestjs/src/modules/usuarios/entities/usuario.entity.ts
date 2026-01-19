import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rol } from './rol.entity';
import { UsuarioPermiso } from './usuario-permiso.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  empresa_id: number; // Multi-tenancy


  @Column({ length: 100, unique: true })
  nombre_usuario: string;

  @Column({ length: 255 })
  nombre_completo: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'int', default: 1 })
  activo: number;

  @Column({ type: 'int', nullable: true })
  rol_id: number;

  @ManyToOne(() => Rol, { nullable: true })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @OneToMany(() => UsuarioPermiso, (permiso) => permiso.usuario)
  permisos: UsuarioPermiso[];

  // Campos adicionales tipo RRHH
  @Column({ length: 20, nullable: true })
  identificacion: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ type: 'date', nullable: true })
  fecha_ingreso: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 460.00, nullable: true })
  sueldo: number;

  @Column({ type: 'text', nullable: true })
  foto_cedula_anverso: string;

  @Column({ type: 'text', nullable: true })
  foto_cedula_reverso: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}



