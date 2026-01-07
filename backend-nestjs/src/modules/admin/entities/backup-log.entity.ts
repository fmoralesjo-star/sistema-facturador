import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('backup_logs')
export class BackupLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    archivo: string;

    @Column({ type: 'bigint', nullable: true })
    tamano: number;

    @Column({ type: 'varchar', length: 50, default: 'PENDING' }) // PENDING, SUCCESS, ERROR
    estado: string;

    @Column({ type: 'text', nullable: true })
    mensaje_error: string;

    @CreateDateColumn({ type: 'timestamp' })
    fecha_creacion: Date;
}
