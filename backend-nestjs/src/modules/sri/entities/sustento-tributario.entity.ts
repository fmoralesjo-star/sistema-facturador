import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sustento_tributario')
export class SustentoTributario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 10, unique: true })
    codigo: string; // Ej: 01, 02

    @Column({ length: 255 })
    descripcion: string;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
