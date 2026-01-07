import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { ProformaDetalle } from './proforma-detalle.entity';
import { Empresa } from '../../empresa/entities/empresa.entity';
import { Empleado } from '../../recursos-humanos/entities/empleado.entity';

@Entity('proformas')
export class Proforma {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 50 })
    numero: string; // Ejemplo: PROF-001-000001

    @ManyToOne(() => Cliente, { nullable: true })
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    @Column({ nullable: true })
    cliente_id: number;

    @ManyToOne(() => Empresa, { nullable: true })
    @JoinColumn({ name: 'empresa_id' })
    empresa: Empresa;

    @Column({ nullable: true })
    empresa_id: number;

    @ManyToOne(() => Empleado, { nullable: true })
    @JoinColumn({ name: 'vendedor_id' })
    vendedor: Empleado;

    @Column({ nullable: true })
    vendedor_id: number;

    @Column({ type: 'date' })
    fecha: Date;

    @Column({ type: 'date', nullable: true })
    fecha_validez: Date; // Validez de la oferta

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    impuesto: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({ length: 20, default: 'PENDIENTE' })
    estado: string; // PENDIENTE, FACTURADO, RECHAZADO, VENCIDO

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    // Información instantánea del cliente por si cambia después
    @Column({ length: 255, nullable: true })
    cliente_nombre: string;

    @Column({ length: 20, nullable: true })
    cliente_ruc: string;

    @Column({ type: 'text', nullable: true })
    cliente_direccion: string;

    @Column({ length: 50, nullable: true })
    cliente_telefono: string;

    @Column({ length: 255, nullable: true })
    cliente_email: string;

    @OneToMany(() => ProformaDetalle, (detalle) => detalle.proforma, { cascade: true })
    detalles: ProformaDetalle[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
