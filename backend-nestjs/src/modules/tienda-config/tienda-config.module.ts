import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiendaConfigService } from './tienda-config.service';
import { TiendaConfigController } from './tienda-config.controller';
import { TiendaConfig } from './entities/tienda-config.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TiendaConfig])],
    controllers: [TiendaConfigController],
    providers: [TiendaConfigService],
    exports: [TiendaConfigService]
})
export class TiendaConfigModule { }
