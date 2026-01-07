import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { ProductoPuntoVenta } from '../../inventario/entities/producto-punto-venta.entity';

@Entity('puntos_venta')
export class PuntoVenta {
    @PrimaryGeneratedColumn()
    id: number;

    // Nota: La columna establecimiento_id no existe en la tabla actual
    // Se comenta esta relación hasta que se agregue la columna
    // @ManyToOne(() => Establecimiento, (establecimiento) => establecimiento.puntosEmision, { nullable: true })
    // @JoinColumn({ name: 'establecimiento_id' })
    // establecimiento: Establecimiento;

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
