import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { TiendaConfigService } from './tienda-config.service';
import { UpdateTiendaConfigDto } from './dto/update-tienda-config.dto';

@Controller('tienda-config')
export class TiendaConfigController {
    constructor(private readonly tiendaConfigService: TiendaConfigService) { }

    @Get()
    find() {
        return this.tiendaConfigService.findConfig();
    }

    @Patch()
    update(@Body() updateTiendaConfigDto: UpdateTiendaConfigDto) {
        return this.tiendaConfigService.updateConfig(updateTiendaConfigDto);
    }
}
