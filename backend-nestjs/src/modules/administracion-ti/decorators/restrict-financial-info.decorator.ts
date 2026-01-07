import { UseGuards, applyDecorators } from '@nestjs/common';
import { RestrictFinancialInfoGuard } from '../guards/restrict-financial-info.guard';

/**
 * Decorator que restringe el acceso a información financiera para Administradores de TI
 * 
 * Uso:
 * @RestrictFinancialInfo()
 * @Get('balance-general')
 * async getBalanceGeneral() { ... }
 */
export function RestrictFinancialInfo() {
  return applyDecorators(UseGuards(RestrictFinancialInfoGuard));
}










