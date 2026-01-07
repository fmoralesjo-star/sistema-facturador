import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Rol } from '../../usuarios/entities/rol.entity';

@Entity('autorizaciones_2fa')
export class Autorizacion2FA {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_solicitante_id' })
  usuario_solicitante_id: number;

  @Column({ name: 'usuario_autorizador_id' })
  usuario_autorizador_id: number;

  @Column({ name: 'rol_solicitado_id' })
  rol_solicitado_id: number;

  @Column({ name: 'codigo_verificacion', length: 6 })
  codigo_verificacion: string;

  @Column({ type: 'enum', enum: ['pendiente', 'aprobado', 'rechazado', 'expirado'], default: 'pendiente' })
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'expirado';

  @Column({ name: 'fecha_expiracion', type: 'timestamp', nullable: true })
  fecha_expiracion: Date;

  @Column({ name: 'fecha_aprobacion', type: 'timestamp', nullable: true })
  fecha_aprobacion: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_solicitante_id' })
  usuario_solicitante: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_autorizador_id' })
  usuario_autorizador: Usuario;

  @ManyToOne(() => Rol, { nullable: true })
  @JoinColumn({ name: 'rol_solicitado_id' })
  rol_solicitado: Rol;
}
