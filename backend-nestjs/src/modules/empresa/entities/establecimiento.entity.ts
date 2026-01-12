import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PuntoVenta } from '../../puntos-venta/entities/punto-venta.entity';

@Entity('establecimientos')
export class Establecimiento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 3 })
    codigo: string; // Ej: 001, 002

    @Column({ length: 255, nullable: true })
    nombre_comercial: string; // El nombre comercial específico para este establecimiento (si difiere)

    @Column({ type: 'text' })
    direccion: string;

    @Column({ default: true })
    activo: boolean;

    @OneToMany(() => PuntoVenta, (punto) => punto.establecimiento)
    puntosEmision: PuntoVenta[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
