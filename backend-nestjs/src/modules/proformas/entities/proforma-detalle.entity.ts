import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Proforma } from './proforma.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('proforma_detalles')
export class ProformaDetalle {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Proforma, (proforma) => proforma.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proforma_id' })
    proforma: Proforma;

    @Column()
    proforma_id: number;

    @ManyToOne(() => Producto, { nullable: true })
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @Column({ nullable: true })
    producto_id: number;

    @Column({ nullable: true })
    codigo: string;

    @Column({ nullable: true })
    descripcion: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cantidad: number;

    @Column({ type: 'decimal', precision: 10, scale: 6 })
    precio_unitario: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    descuento: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    impuesto: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;
}
