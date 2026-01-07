import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProformasService } from './proformas.service';
import { ProformasController } from './proformas.controller';
import { Proforma } from './entities/proforma.entity';
import { ProformaDetalle } from './entities/proforma-detalle.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Proforma, ProformaDetalle])],
    controllers: [ProformasController],
    providers: [ProformasService],
    exports: [ProformasService]
})
export class ProformasModule { }
