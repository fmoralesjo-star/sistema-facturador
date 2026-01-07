import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BancosService } from './bancos.service';
import { BancosController } from './bancos.controller';
import { Banco } from './entities/banco.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banco])],
  controllers: [BancosController],
  providers: [BancosService],
  exports: [BancosService],
})
export class BancosModule {}












