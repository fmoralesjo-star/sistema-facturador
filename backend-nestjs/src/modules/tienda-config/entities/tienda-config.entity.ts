import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tienda_config')
export class TiendaConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 'Bienvenido a Urban Style Store' })
    bannerTitulo: string;

    @Column({ default: 'Tecnología que impulsa tu mundo' })
    bannerSubtitulo: string;

    @Column({ default: '#0066FF' })
    colorPrimario: string;

    @Column({ default: '#00CC66' })
    colorSecundario: string;

    @Column({ nullable: true })
    bannerImagenUrl: string;

    @Column({ default: true })
    mostrarBanner: boolean;
}
