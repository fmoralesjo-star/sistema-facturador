import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajaChicaController } from './caja-chica.controller';
import { CajaChicaService } from './caja-chica.service';
import { CajaChicaMovimiento } from './entities/caja-chica-movimiento.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CajaChicaMovimiento])],
    controllers: [CajaChicaController],
    providers: [CajaChicaService],
    exports: [CajaChicaService]
})
export class CajaChicaModule { }
