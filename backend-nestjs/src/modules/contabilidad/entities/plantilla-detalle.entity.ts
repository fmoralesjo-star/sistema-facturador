import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PlantillaAsiento } from './plantilla-asiento.entity';

export enum TipoMovimiento {
    DEBE = 'DEBE',
    HABER = 'HABER',
}

export enum TipoValor {
    TOTAL = 'TOTAL',
    SUBTOTAL_15 = 'SUBTOTAL_15',
    SUBTOTAL_0 = 'SUBTOTAL_0',
    IVA = 'IVA',
    DESCUENTO = 'DESCUENTO',
    ICE = 'ICE',
    PROPINA = 'PROPINA',
    VALOR_FIJO = 'VALOR_FIJO',
    RETENCION_RENTA = 'RETENCION_RENTA',
    RETENCION_IVA = 'RETENCION_IVA',
}

@Entity('plantilla_detalles')
export class PlantillaDetalle {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => PlantillaAsiento, (plantilla) => plantilla.detalles, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'plantilla_id' })
    plantilla: any;

    @Column()
    plantilla_id: number;

    @Column({ length: 50 })
    cuenta_codigo: string; // Puede ser un código real '1.1.01' o un comodín '@CLIENTE', '@CAJA', '@GASTO'

    @Column({ type: 'enum', enum: TipoMovimiento })
    tipo_movimiento: TipoMovimiento;

    @Column({ type: 'enum', enum: TipoValor })
    tipo_valor: TipoValor;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 100.00 })
    porcentaje: number; // Porcentaje del valor base a tomar (ej: 100% del IVA, o 50% del Gasto)

    @Column({ type: 'int', default: 0 })
    orden: number;

    @Column({ type: 'text', nullable: true })
    referencia_opcional: string; // Para guardar notas sobre la regla
}
