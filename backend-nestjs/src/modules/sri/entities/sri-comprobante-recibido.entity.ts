import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sri_comprobantes_recibidos')
export class SriComprobanteRecibido {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 49, unique: true })
    clave_acceso: string;

    @Column({ length: 13 })
    ruc_emisor: string;

    @Column()
    razon_social_emisor: string;

    @Column({ type: 'date' })
    fecha_emision: Date;

    @Column()
    tipo_comprobante: string; // FACTURA, NOTA DE CRÉDITO, etc.

    @Column({ length: 20 })
    serie: string; // 001-001

    @Column({ length: 20 })
    numero_comprobante: string; // 000012345

    @Column('decimal', { precision: 14, scale: 2 })
    importe_total: number;

    @Column({ type: 'text', nullable: true })
    xml_url: string; // URL de descarga del XML

    @Column({ type: 'text', nullable: true })
    xml_content: string; // Contenido XML si se descarga

    @Column({ default: 'PENDIENTE', length: 20 })
    estado: string; // PENDIENTE, PROCESADO, ERROR, ANULADO

    @Column({ type: 'jsonb', nullable: true })
    detalles_json: any; // Para almacenar respuesta cruda o detalles adicionales

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
