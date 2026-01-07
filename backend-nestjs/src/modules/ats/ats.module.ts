import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';
import { Factura } from '../facturas/entities/factura.entity';
import { Compra } from '../compras/entities/compra.entity';
import { Empresa } from '../empresa/entities/empresa.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Factura, Compra, Empresa])
    ],
    controllers: [AtsController],
    providers: [AtsService],
    exports: [AtsService]
})
export class AtsModule { }
