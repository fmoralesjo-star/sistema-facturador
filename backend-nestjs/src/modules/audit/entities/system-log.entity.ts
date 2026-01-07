import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('logs_sistema')
export class SystemLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    transaction_id: string; // UUID compartido por la operación ACID

    @Column()
    modulo: string; // 'VENTAS', 'COMPRAS', 'INVENTARIO', 'CONTABILIDAD'

    @Column()
    accion: string; // 'CREAR_FACTURA', 'AUTORIZAR_SRI', etc.

    @Column({ nullable: true })
    usuario_id: number;

    @Column({ type: 'text', nullable: true })
    detalles: string; // JSON stringificado si es necesario

    @Column({ nullable: true })
    entidad_id: number; // ID de la factura, compra, etc.

    @Column({ nullable: true })
    entidad_tipo: string; // 'Factura', 'Compra'

    @CreateDateColumn()
    fecha: Date;

    @Column({ nullable: true })
    ip: string;
}
