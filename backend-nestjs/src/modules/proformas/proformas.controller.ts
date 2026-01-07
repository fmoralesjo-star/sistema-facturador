import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProformasService } from './proformas.service';

@Controller('proformas')
export class ProformasController {
    constructor(private readonly proformasService: ProformasService) { }

    @Post()
    create(@Body() createProformaDto: any) {
        return this.proformasService.create(createProformaDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.proformasService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.proformasService.findOne(+id);
    }
}
