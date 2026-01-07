import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Banco } from '../../bancos/entities/banco.entity';

@Entity('movimientos_bancarios_extracto')
export class MovimientoBancarioExtracto {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Banco)
    @JoinColumn({ name: 'banco_id' })
    banco: any;

    @Column()
    banco_id: number;

    @Column({ type: 'date' })
    fecha: Date;

    @Column({ type: 'text' })
    descripcion: string; // Glosa del banco

    @Column({ length: 100, nullable: true })
    referencia: string; // Documento/Num comprobante del banco

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    monto: number; // Positivo (Depósito) o Negativo (Retiro)

    @Column({ default: false })
    conciliado: boolean;

    @Column({ nullable: true })
    conciliacion_bancaria_id: number; // ID del movimiento del sistema con el que hizo match

    @CreateDateColumn()
    created_at: Date;
}
