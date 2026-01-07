import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PuntoVenta } from '../../puntos-venta/entities/punto-venta.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum CategoriaGasto {
    SERVICIOS_PUBLICOS = 'SERVICIOS_PUBLICOS',
    INTERNET_TELEFONIA = 'INTERNET_TELEFONIA',
    SUMINISTROS_OFICINA = 'SUMINISTROS_OFICINA',
    LIMPIEZA = 'LIMPIEZA',
    TRANSPORTE = 'TRANSPORTE',
    ALIMENTACION = 'ALIMENTACION',
    REPRESENTACION = 'REPRESENTACION',
    REPOSICION_FONDO = 'REPOSICION_FONDO',
    VARIOS = 'VARIOS'
}

@Entity('caja_chica_movimientos')
export class CajaChicaMovimiento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    punto_venta_id: number;

    @ManyToOne(() => PuntoVenta)
    @JoinColumn({ name: 'punto_venta_id' })
    punto_venta: PuntoVenta;

    @Column({
        type: 'enum',
        enum: ['INGRESO', 'GASTO'],
        default: 'GASTO'
    })
    tipo: 'INGRESO' | 'GASTO';

    @Column({
        type: 'enum',
        enum: CategoriaGasto,
        default: CategoriaGasto.VARIOS
    })
    categoria: CategoriaGasto;

    @Column({ default: true })
    es_deducible: boolean;

    @Column('decimal', { precision: 10, scale: 2 })
    monto: number;

    @Column()
    descripcion: string;

    @Column({ nullable: true })
    referencia: string;

    @Column({ nullable: true })
    numero_documento: string;

    @Column({ nullable: true })
    proveedor_nombre: string;

    @CreateDateColumn()
    fecha: Date;

    @Column()
    usuario_id: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Column('decimal', { precision: 10, scale: 2 })
    saldo_resultante: number;
}
