import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('impuestos_iva')
export class ImpuestoIVA {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 10, unique: true })
    codigo: string; // Código SRI (ej: 2, 0, 6, 7)

    @Column({ length: 50 })
    descripcion: string; // Ej: IVA 12%, IVA 0%

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    porcentaje: number; // Ej: 12.00, 15.00

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
