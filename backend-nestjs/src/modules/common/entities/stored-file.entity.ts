import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('stored_files')
export class StoredFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column()
    mime_type: string;

    @Column('bytea')
    data: Buffer;

    @Column('int')
    size: number;

    @CreateDateColumn()
    created_at: Date;
}
