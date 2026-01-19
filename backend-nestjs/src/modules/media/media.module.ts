import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { ProductosModule } from '../productos/productos.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({
    imports: [ProductosModule, ConfigModule],
    controllers: [MediaController],
    providers: [CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryService],
})
export class MediaModule { }
