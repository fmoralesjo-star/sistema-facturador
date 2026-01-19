
import { Controller, Post, UseInterceptors, UploadedFile, Param, ParseIntPipe, BadRequestException, Body, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ProductosService } from '../productos/productos.service';
import { CloudinaryService } from './cloudinary.service';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';

@Controller('media')
export class MediaController {
    constructor(
        // @Inject('ProductosService') // Circular dependency risk? Use direct service if possible or forwardref
        // private productosService: ProductosService, // Optional: Update entity directly
        private configService: ConfigService,
        private cloudinaryService: CloudinaryService,
        private cls: ClsService,
    ) { }

    @Post('productos/:id/imagen')
    @UseInterceptors(FileInterceptor('file', {
        // storage: memoryStorage() // Default
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                return cb(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }
    }))
    async uploadProductoImagen(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }

        const tenantId = this.cls.get('TENANT_ID') || 'public';
        const folder = `facturador/${tenantId}/productos`;

        const result = await this.cloudinaryService.uploadFile(file, folder);
        const imageUrl = result.secure_url;

        // Si la ID es numérica, intentar actualizar el producto (TODO: Connect Service)
        // if (!isNaN(Number(id))) {
        //     await this.productosService.update(Number(id), { imagen_url: imageUrl });
        // }

        return {
            success: true,
            data: {
                url: imageUrl,
                public_id: result.public_id,
                originalName: file.originalname,
            }
        };
    }
}
