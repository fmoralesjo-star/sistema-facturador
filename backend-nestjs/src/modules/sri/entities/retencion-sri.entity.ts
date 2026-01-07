import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('retenciones_sri')
export class RetencionSRI {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 10, unique: true })
    codigo: string; // Ej: 312, 3440

    @Column({ length: 255 })
    descripcion: string;

    @Column({ length: 20 })
    tipo: string; // 'RENTA' o 'IVA'

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    porcentaje: number;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
