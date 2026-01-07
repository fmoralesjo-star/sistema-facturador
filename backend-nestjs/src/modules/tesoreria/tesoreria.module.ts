import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cheque } from './entities/cheque.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Cheque]),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class TesoreriaModule { }
