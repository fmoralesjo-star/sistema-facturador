import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { ProductoPuntoVenta } from '../../inventario/entities/producto-punto-venta.entity';
import { Establecimiento } from '../../empresa/entities/establecimiento.entity';

@Entity('puntos_venta')
export class PuntoVenta {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Establecimiento, (establecimiento) => establecimiento.puntosEmision, { nullable: true })
    @JoinColumn({ name: 'establecimiento_id' })
    establecimiento: Establecimiento;

    @Column({ nullable: true })
    establecimiento_id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 10, unique: true })
    codigo: string;

    @Column({ type: 'text' })
    direccion: string;

    @Column({ length: 50, nullable: true })
    telefono: string;

    @Column({ length: 255, nullable: true })
    email: string;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ length: 50, default: 'TIENDA' })
    tipo: string; // TIENDA, BODEGA

    @Column({ default: false })
    es_principal: boolean;

    @Column({ default: true })
    activo: boolean;

    @Column({ type: 'int', default: 1 })
    secuencia_factura: number;

    @Column({ type: 'int', default: 1 })
    secuencia_nota_credito: number;

    @OneToMany(() => ProductoPuntoVenta, (stock) => stock.puntoVenta)
    stocks: ProductoPuntoVenta[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
