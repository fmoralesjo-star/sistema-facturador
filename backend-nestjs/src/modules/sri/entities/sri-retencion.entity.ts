import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum TipoRetencion {
    RENTA = 'RENTA',
    IVA = 'IVA',
    ISD = 'ISD',
}

@Entity('sri_retenciones_v3')
export class SriRetencionV3 {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 10 })
    codigo: string; // Ej: 312, 3440, 9, 10

    @Column({ length: 300 })
    descripcion: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    porcentaje: number; // Ej: 1.75

    @Column({ type: 'varchar', length: 20, default: 'RENTA' })
    tipo: string; // Changed from ENUM to varchar for safer deployment

    @Column({ type: 'date', nullable: true })
    fecha_vigencia_inicio: Date; // Para manejar cambios de normativa en el tiempo

    @Column({ type: 'date', nullable: true })
    fecha_vigencia_fin: Date;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
