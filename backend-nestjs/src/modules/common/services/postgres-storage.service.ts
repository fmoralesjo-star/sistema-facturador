import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoredFile } from '../entities/stored-file.entity';
import * as path from 'path';

/**
 * Servicio para gestionar almacenamiento de archivos en PostgreSQL (BLOBs)
 */
@Injectable()
export class PostgresStorageService {
    private readonly logger = new Logger(PostgresStorageService.name);

    constructor(
        @InjectRepository(StoredFile)
        private readonly fileRepository: Repository<StoredFile>,
    ) { }

    /**
     * Guarda un archivo en la base de datos
     * @param buffer Contenido del archivo
     * @param filename Nombre original
     * @param mimeType Tipo MIME (application/pdf, text/xml, etc)
     * @returns ID del archivo guardado (UUID)
     */
    async uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
        const newFile = this.fileRepository.create({
            filename,
            mime_type: mimeType,
            data: buffer,
            size: buffer.length,
        });

        const saved = await this.fileRepository.save(newFile);
        this.logger.log(`Archivo guardado en DB: ${filename} (ID: ${saved.id})`);

        // Retornamos un formato URI interno si deseamos, o solo el UUID. 
        // Para simplificar integración, retornamos solo ID, y el 'path' externo será db://<id>
        return saved.id;
    }

    /**
     * Obtiene el contenido de un archivo
     * @param fileId UUID del archivo o URI db://uuid
     */
    async getFile(fileId: string): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
        // Limpiar prefijo db:// si existe
        const cleanId = fileId.replace('db://', '');

        const file = await this.fileRepository.findOne({ where: { id: cleanId } });
        if (!file) {
            throw new NotFoundException(`Archivo no encontrado: ${cleanId}`);
        }

        return {
            buffer: file.data,
            mimeType: file.mime_type,
            filename: file.filename,
        };
    }

    /**
     * Elimina un archivo
     */
    async deleteFile(fileId: string): Promise<void> {
        const cleanId = fileId.replace('db://', '');
        await this.fileRepository.delete(cleanId);
        this.logger.log(`Archivo eliminado de DB: ${cleanId}`);
    }
}
