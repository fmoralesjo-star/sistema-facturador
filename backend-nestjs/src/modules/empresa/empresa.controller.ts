import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) { }

  @Post()
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresaService.create(createEmpresaDto);
  }

  @Get()
  findAll() {
    return this.empresaService.findAll();
  }

  @Get('activa')
  findActive() {
    return this.empresaService.findActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ) {
    return this.empresaService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.remove(id);
  }

  @Post(':id/activar')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.activate(id);
  }

  @Post(':id/desactivar')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.deactivate(id);
  }

  @Post(':ruc/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const ruc = req.params.ruc;
          // Guardar como {RUC}.png (o extension original)
          // Para simplificar, forzamos png o mantenemos extension
          const ext = path.extname(file.originalname);
          cb(null, `${ruc}${ext}`);
        },
      }),
    }),
  )
  uploadLogo(@Param('ruc') ruc: string, @UploadedFile() file: Express.Multer.File) {
    return { success: true, message: 'Logo cargado exitosamente', filename: file.filename };
  }
}


















