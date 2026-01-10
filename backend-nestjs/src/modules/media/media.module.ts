
import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { ProductosModule } from '../productos/productos.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ProductosModule, ConfigModule],
    controllers: [MediaController],
    providers: [],
})
export class MediaModule { }
