import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('configuraciones')
export class Configuracion {
    @PrimaryColumn()
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
