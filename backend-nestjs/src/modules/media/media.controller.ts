
import { Controller, Post, UseInterceptors, UploadedFile, Param, ParseIntPipe, BadRequestException, Body, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ProductosService } from '../productos/productos.service';
import { ConfigService } from '@nestjs/config';

@Controller('media')
export class MediaController {
    constructor(
        @Inject('ProductosService')
        private productosService: ProductosService,
        private configService: ConfigService,
    ) { }

    @Post('productos/:id/imagen')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/productos', // Archivos físicos sí van en uploads/ (root)
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                return cb(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        }
    }))
    async uploadProductoImagen(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }

        const host = this.configService.get<string>('HOST_URL') || 'http://localhost:3000';
        // Construir URL pública
        // Se asume que /uploads está servido estáticamente en main.ts
        const imageUrl = `${host}/uploads/productos/${file.filename}`;

        // Si la ID es numérica, intentar actualizar el producto
        if (!isNaN(Number(id))) {
            // await this.productosService.update(Number(id), { imagen_url: imageUrl });
            console.log(`TODO: Actualizar producto ${id} con imagen ${imageUrl}`);
        }

        return {
            success: true,
            data: {
                url: imageUrl,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size
            }
        };
    }
}
