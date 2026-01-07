import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('transacciones_bancarias')
export class TransaccionBancaria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    banco_id: number;

    @Column({ type: 'date' })
    fecha: Date;

    @Column()
    referencia: string;

    @Column('text')
    descripcion: string;

    @Column({
        type: 'varchar',
        length: 20
    })
    tipo: string; // DEBITO, CREDITO

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    monto: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    saldo: number;

    // Estado de conciliación
    @Column({
        type: 'varchar',
        default: 'PENDIENTE'
    })
    estado: string; // PENDIENTE, CONCILIADA, REVISIÓN

    // Si fue conciliada
    @Column({ nullable: true })
    conciliacion_id: number;

    @Column({ nullable: true })
    asiento_contable_id: number;

    // Metadata de IA
    @Column({ type: 'float', nullable: true })
    score_ia: number; // 0-1

    @Column({ nullable: true, type: 'json' })
    metadata_ia: any;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
