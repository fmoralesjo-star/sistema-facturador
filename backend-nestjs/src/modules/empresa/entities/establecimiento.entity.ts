import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

    // Nota: Relación comentada porque la columna establecimiento_id no existe en puntos_venta
    // @OneToMany(() => PuntoVenta, (punto) => punto.establecimiento)
    // puntosEmision: PuntoVenta[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
