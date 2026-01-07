import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Módulo Redis deshabilitado temporalmente
// Para habilitar Redis, descomentar este módulo y asegúrate de que Redis esté corriendo
@Module({})
export class RedisModule {}

/* Módulo Redis original - descomentar si Redis está disponible
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'sri-queue',
    }),
  ],
})
export class RedisModule {}
*/


