import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('usuario_permisos')
export class UsuarioPermiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  usuario_id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.permisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ length: 100 })
  modulo: string;

  @Column({ type: 'int', default: 0 })
  tiene_acceso: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}



