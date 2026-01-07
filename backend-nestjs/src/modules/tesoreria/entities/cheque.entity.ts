import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Banco } from '../../bancos/entities/banco.entity';
import { Proveedor } from '../../compras/entities/proveedor.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';

export enum EstadoCheque {
    EMITIDO = 'EMITIDO',
    ENTREGADO = 'ENTREGADO',
    COBRADO = 'COBRADO',
    ANULADO = 'ANULADO',
    PROTESTADO = 'PROTESTADO', // Sin fondos
    DEPOSITADO = 'DEPOSITADO', // Cheques de clientes
}

export enum TipoCheque {
    GIRADO = 'GIRADO', // Nosotros pagamos
    RECIBIDO = 'RECIBIDO', // Cliente nos paga
}

@Entity('cheques')
export class Cheque {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    numero: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    monto: number;

    @Column({ type: 'date' })
    fecha_emision: Date;

    @Column({ type: 'date' })
    fecha_pago: Date; // Fecha del cheque (posfechado)

    @Column({ length: 255, nullable: true })
    beneficiario: string;

    @Column({ type: 'enum', enum: TipoCheque, default: TipoCheque.GIRADO })
    tipo: TipoCheque;

    @Column({ type: 'enum', enum: EstadoCheque, default: EstadoCheque.EMITIDO })
    estado: EstadoCheque;

    // Relaciones

    @ManyToOne(() => Banco, { nullable: true })
    @JoinColumn({ name: 'banco_id' })
    banco: any; // Banco de donde sale el dinero (si es girado) o banco emisor (si es recibido)

    @Column({ nullable: true })
    banco_id: number;

    @ManyToOne(() => Proveedor, { nullable: true })
    @JoinColumn({ name: 'proveedor_id' })
    proveedor: any; // A quien pagamos

    @ManyToOne(() => Cliente, { nullable: true })
    @JoinColumn({ name: 'cliente_id' })
    cliente: any; // Quien nos paga

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
