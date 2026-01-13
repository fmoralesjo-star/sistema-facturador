import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('app_configurations')
export class Configuracion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    clave: string;

    @Column({ type: 'text', nullable: true })
    valor: string;

    @Column({ nullable: true })
    descripcion: string;

    @Column({ default: 'string' }) // 'string', 'number', 'boolean', 'json'
    tipo: string;

    @Column({ default: 'GENERAL' }) // 'EMISION', 'RIDE', 'PUNTOS', 'GENERAL'
    grupo: string;
}
