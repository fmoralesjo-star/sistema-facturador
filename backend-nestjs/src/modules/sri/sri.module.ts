import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SriService } from './sri.service';
import { SriController } from './sri.controller';
import { SriProcessor } from './processors/sri.processor';
import { FirmaElectronicaService } from './services/firma-electronica.service';
import { XmlGeneratorService } from './services/xml-generator.service';
import { XadesBesService } from './services/xades-bes.service';
import { SriWsService } from './services/sri-ws.service';
import { RideService } from './services/ride.service';
import { XsdValidationService } from './services/xsd-validation.service';
import { Factura } from '../facturas/entities/factura.entity';
import { Voucher } from '../facturas/entities/voucher.entity';
import { ImpuestoIVA } from './entities/impuesto-iva.entity';
import { RetencionSRI } from './entities/retencion-sri.entity';
import { SustentoTributario } from './entities/sustento-tributario.entity';
import { EmpresaModule } from '../empresa/empresa.module';
import { ParametrosSriService } from './parametros-sri.service';
import { ParametrosSriController } from './parametros-sri.controller';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { Configuracion } from '../admin/entities/configuracion.entity';

import { NotaCredito } from '../notas-credito/entities/nota-credito.entity';
import { SriRetencionV3 } from './entities/sri-retencion.entity';
import { TaxEngineService } from './services/tax-engine.service';
import { ContabilidadModule } from '../contabilidad/contabilidad.module';
import { SriComprobanteRecibido } from './entities/sri-comprobante-recibido.entity';
import { IntegracionModule } from '../integracion/integracion.module';
import { SriScheduler } from './sri.scheduler';
import { Empresa } from '../empresa/entities/empresa.entity';


@Module({
  imports: [
    // BullModule removed - Migrated to Postgres Queue (CommonModule)

    // NOTA: Este módulo requiere TypeORM (PostgreSQL)
    // Si estás usando Firestore, este módulo NO debe ser importado en app.module.ts
    TypeOrmModule.forFeature([
      Factura,
      Voucher,
      ImpuestoIVA,
      RetencionSRI,
      SustentoTributario,
      NotaCredito,
      SriRetencionV3,
      SriRetencionV3,
      Configuracion, // Necessary for CircuitBreaker
      SriComprobanteRecibido,
      Empresa, // Added for SriScheduler
    ]),
    EmpresaModule,
    ContabilidadModule,
    IntegracionModule, // Added for n8n service
  ],
  controllers: [SriController, ParametrosSriController],
  providers: [
    SriService,
    ParametrosSriService,
    SriProcessor,
    FirmaElectronicaService,
    XmlGeneratorService,
    XadesBesService,
    SriWsService,
    RideService,
    TaxEngineService,
    XsdValidationService,
    CircuitBreakerService,
    SriScheduler, // Registered Scheduler
  ],
  exports: [SriService, FirmaElectronicaService, XmlGeneratorService, RideService, TaxEngineService, XsdValidationService, CircuitBreakerService],
})
export class SriModule { }

