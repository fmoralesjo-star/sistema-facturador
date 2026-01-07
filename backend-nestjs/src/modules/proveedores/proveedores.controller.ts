import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';

@Controller('proveedores')
export class ProveedoresController {
    constructor(private readonly proveedoresService: ProveedoresService) { }

    @Post()
    create(@Body() createProveedorDto: any) {
        return this.proveedoresService.create(createProveedorDto);
    }

    @Get()
    findAll() {
        return this.proveedoresService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.proveedoresService.findOne(id);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProveedorDto: any) {
        return this.proveedoresService.update(id, updateProveedorDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.proveedoresService.remove(id);
    }
}
