import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PlantillaDetalle } from './plantilla-detalle.entity';

export enum OrigenAsiento {
    VENTAS = 'VENTAS',
    COMPRAS = 'COMPRAS',
    TESORERIA = 'TESORERIA',
    INVENTARIO = 'INVENTARIO',
    NOMINA = 'NOMINA',
}

@Entity('plantillas_asientos')
export class PlantillaAsiento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 50 })
    codigo: string; // Ej: VENTA_FACTURA, COMPRA_GASTO

    @Column({ length: 100 })
    nombre: string;

    @Column({ type: 'enum', enum: OrigenAsiento })
    origen: OrigenAsiento;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ default: true })
    activo: boolean;

    @OneToMany(() => PlantillaDetalle, (detalle) => detalle.plantilla, {
        cascade: true,
    })
    detalles: any[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
