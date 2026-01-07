import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('liquidaciones_compra')
export class LiquidacionCompra {
    @PrimaryGeneratedColumn()
    id: number;

    // Identificación
    @Column({ default: '001' })
    establecimiento: string;

    @Column({ default: '001' })
    punto_emision: string;

    @Column()
    secuencial: string;

    @Column({ type: 'date' })
    fecha_emision: Date;

    // Proveedor (Persona Natural)
    @Column()
    proveedor_identificacion: string; // Cédula

    @Column()
    proveedor_nombre: string;

    @Column({ nullable: true })
    proveedor_direccion: string;

    @Column({ nullable: true })
    proveedor_telefono: string;

    @Column({ nullable: true })
    proveedor_email: string;

    // Detalle de la compra
    @Column('text')
    concepto: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotal_0: number; // Base 0%

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotal_12: number; // Base 12%

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    iva: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    // Retenciones (opcionales)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    retencion_renta: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    retencion_iva: number;

    @Column({ nullable: true })
    codigo_retencion_renta: string;

    @Column({ nullable: true })
    codigo_retencion_iva: string;

    // Autorización SRI
    @Column({ nullable: true })
    numero_autorizacion: string;

    @Column({ nullable: true, type: 'timestamp' })
    fecha_autorizacion: Date;

    @Column({
        type: 'varchar',
        default: 'PENDIENTE'
    })
    estado: string; // PENDIENTE, AUTORIZADA, NO_AUTORIZADA, ANULADA

    // Archivos
    @Column({ nullable: true })
    xml_path: string;

    @Column({ nullable: true })
    pdf_path: string;

    // Metadatos
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ nullable: true, type: 'text' })
    observaciones: string;
}
