import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Factura } from '../../facturas/entities/factura.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('notas_credito')
export class NotaCredito {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 50 })
    numero: string;

    @Column({ type: 'date' })
    fecha: Date;

    @ManyToOne(() => Factura)
    @JoinColumn({ name: 'factura_id' })
    factura: Factura;

    @Column()
    factura_id: number;

    @ManyToOne(() => Cliente)
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    @Column()
    cliente_id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    impuesto: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({ type: 'text', nullable: true })
    motivo: string;

    @Column({ length: 20, default: 'EMITIDO' })
    estado: string;

    // Campos SRI
    @Column({ length: 49, nullable: true })
    clave_acceso: string;

    @Column({ length: 100, nullable: true })
    autorizacion: string;

    @Column({ type: 'date', nullable: true })
    fecha_autorizacion: Date;

    // Campos adicionales para el RIDE (JSON)
    @Column({ type: 'simple-json', nullable: true })
    info_adicional: { nombre: string; valor: string }[];

    @OneToMany(() => NotaCreditoDetalle, (detalle) => detalle.notaCredito, { cascade: true })
    detalles: NotaCreditoDetalle[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

@Entity('nota_credito_detalles')
export class NotaCreditoDetalle {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => NotaCredito, (nc) => nc.detalles)
    @JoinColumn({ name: 'nota_credito_id' })
    notaCredito: NotaCredito;

    @Column()
    nota_credito_id: number;

    @Column()
    producto_id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cantidad: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;
}
