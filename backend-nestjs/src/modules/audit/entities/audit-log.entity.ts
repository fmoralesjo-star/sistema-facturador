import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'usuario_id', nullable: true })
    usuario_id: number;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Column({ length: 100, nullable: true })
    usuario_nombre: string;

    @Column({ length: 100 })
    accion: string;

    @Column({ length: 50 })
    modulo: string;

    @Column({ length: 50, nullable: true })
    entidad_id: string;

    @Column({ type: 'text', nullable: true })
    valor_anterior: string;

    @Column({ type: 'text', nullable: true })
    valor_nuevo: string;

    @Column({ length: 50, nullable: true })
    ip_address: string;

    @Column({ type: 'text', nullable: true })
    user_agent: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'text', nullable: true })
    hash: string; // SHA256 hash de los datos clave para detectar manipulación
}
