import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('documentos_pendientes_sri')
export class DocumentoPendienteSRI {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ['FACTURA', 'NOTA_CREDITO', 'ANULACION', 'RETENCION'],
    })
    tipo_documento: 'FACTURA' | 'NOTA_CREDITO' | 'ANULACION' | 'RETENCION';

    @Column()
    documento_id: number;

    @Column()
    numero_documento: string;

    @Column({ nullable: true })
    cliente_nombre: string;

    @Column('text')
    xml_contenido: string;

    @Column({ default: 0 })
    intentos: number;

    @Column({ type: 'timestamp', nullable: true })
    ultimo_intento: Date;

    @Column('text', { nullable: true })
    ultimo_error: string;

    @Column({
        type: 'enum',
        enum: ['PENDIENTE', 'ENVIANDO', 'AUTORIZADA', 'ERROR_PERMANENTE'],
        default: 'PENDIENTE',
    })
    estado: 'PENDIENTE' | 'ENVIANDO' | 'AUTORIZADA' | 'ERROR_PERMANENTE';

    @CreateDateColumn()
    fecha_creacion: Date;

    @Column({ type: 'timestamp', nullable: true })
    fecha_autorizacion: Date;

    @Column({ nullable: true })
    clave_acceso: string;

    @Column({ nullable: true })
    numero_autorizacion: string;

    @UpdateDateColumn()
    fecha_actualizacion: Date;
}
