
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('email_logs')
export class EmailLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    destinatario: string;

    @Column()
    asunto: string;

    @Column({ nullable: true, type: 'text' })
    error_detalle: string;

    @Column({ default: 'PENDIENTE' })
    estado: string; // PENDIENTE, ENVIADO, ERROR

    @CreateDateColumn()
    fecha_creacion: Date;

    @Column({ nullable: true })
    fecha_envio: Date;
}
