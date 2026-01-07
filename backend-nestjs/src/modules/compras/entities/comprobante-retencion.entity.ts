import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum EstadoRetencion {
    GENERADO = 'GENERADO',
    FIRMADO = 'FIRMADO',
    ENVIADO = 'ENVIADO',
    AUTORIZADO = 'AUTORIZADO',
    RECHAZADO = 'RECHAZADO',
    ERROR = 'ERROR',
}

@Entity('comprobantes_retencion')
export class ComprobanteRetencion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    compra_id: number;

    @Column({ length: 49, unique: true })
    clave_acceso: string;

    @Column({ length: 3 })
    establecimiento: string;

    @Column({ length: 3 })
    punto_emision: string;

    @Column({ length: 9 })
    secuencial: string;

    @Column({ type: 'date' })
    fecha_emision: Date;

    // Datos del sujeto retenido (proveedor)
    @Column({ nullable: true })
    proveedor_id: number;

    @Column({ length: 13 })
    ruc_proveedor: string;

    @Column({ length: 300 })
    razon_social_proveedor: string;

    // Documento sustento (la factura del proveedor)
    @Column({ length: 2, default: '01' })
    codigo_sustento: string; // 01 = Factura

    @Column({ length: 2, default: '01' })
    tipo_doc_sustento: string;

    @Column({ length: 17 })
    numero_doc_sustento: string; // 001-001-000000123

    @Column({ type: 'date' })
    fecha_doc_sustento: Date;

    // Retención de Renta
    @Column({ length: 10, nullable: true })
    retencion_renta_codigo: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    retencion_renta_porcentaje: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    retencion_renta_base: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    retencion_renta_valor: number;

    // Retención de IVA
    @Column({ length: 10, nullable: true })
    retencion_iva_codigo: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    retencion_iva_porcentaje: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    retencion_iva_base: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    retencion_iva_valor: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    total_retenido: number;

    // Estado SRI
    @Column({ length: 20, default: 'GENERADO' })
    estado: string;

    @Column({ length: 49, nullable: true })
    numero_autorizacion: string;

    @Column({ type: 'timestamp', nullable: true })
    fecha_autorizacion: Date;

    // Archivos XML
    @Column({ type: 'text', nullable: true })
    xml_generado: string;

    @Column({ type: 'text', nullable: true })
    xml_firmado: string;

    @Column({ type: 'text', nullable: true })
    xml_autorizado: string;

    @Column({ length: 500, nullable: true })
    pdf_path: string;

    // Mensajes del SRI
    @Column({ type: 'jsonb', nullable: true })
    mensajes_sri: any;

    @Column({ type: 'text', nullable: true })
    error_message: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
