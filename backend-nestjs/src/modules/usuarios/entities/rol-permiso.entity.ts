import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity';

@Entity('rol_permisos')
export class RolPermiso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    rol_id: number;

    @Column({ length: 50 })
    modulo: string;

    @ManyToOne(() => Rol, (rol) => rol.permisos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'rol_id' })
    rol: Rol;
}
