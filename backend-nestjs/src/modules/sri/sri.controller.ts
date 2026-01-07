import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  Param,
  Res,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SriService } from './sri.service';
import { FirmaElectronicaService } from './services/firma-electronica.service';
import { RideService } from './services/ride.service';
import { UploadCertificadoDto } from './dto/upload-certificado.dto';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('sri')
export class SriController {
  constructor(
    private readonly sriService: SriService,
    private readonly firmaElectronicaService: FirmaElectronicaService,
    private readonly rideService: RideService,
  ) { }

  /**
   * Endpoint para subir y configurar el certificado .p12
   */
  @Post('certificado/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './certs';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `certificado-${uniqueSuffix}.p12`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/x-pkcs12' || path.extname(file.originalname).toLowerCase() === '.p12') {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos .p12'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadCertificado(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadCertificadoDto,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo');
    }

    try {
      // Cargar certificado para validar
      const certificadoInfo = await this.firmaElectronicaService.cargarCertificadoP12(
        file.path,
        uploadDto.password,
        uploadDto.ruc
      );

      // Encriptar y guardar contraseña
      const passwordEncriptada = await this.firmaElectronicaService.encriptarPassword(
        uploadDto.password,
      );
      await this.firmaElectronicaService.guardarPasswordEncriptada(
        uploadDto.ruc,
        passwordEncriptada,
      );

      // Renombrar archivo con RUC
      // Renombrar y encriptar archivo con RUC
      const nuevoPath = path.join(path.dirname(file.path), `certificado-${uploadDto.ruc}.p12`);
      const fileBuffer = fs.readFileSync(file.path);

      await this.firmaElectronicaService.guardarArchivoEncriptado(nuevoPath, fileBuffer);

      // Eliminar archivo temporal
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        success: true,
        message: 'Certificado cargado exitosamente',
        certificado: {
          ruc: certificadoInfo.ruc,
          razonSocial: certificadoInfo.razonSocial,
          numeroSerie: certificadoInfo.numeroSerie,
          fechaEmision: certificadoInfo.fechaEmision,
          fechaVencimiento: certificadoInfo.fechaVencimiento,
          vigente: this.firmaElectronicaService.verificarVigenciaCertificado(certificadoInfo),
        },
      };
    } catch (error) {
      // Eliminar archivo si hay error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  /**
   * Genera el RIDE (PDF) para una factura
   * GET /api/sri/ride/:facturaId
   */
  @Get('ride/:facturaId')
  async generarRIDE(
    @Param('facturaId', ParseIntPipe) facturaId: number,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.rideService.obtenerRIDE(facturaId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="RIDE-${facturaId}.pdf"`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      throw new BadRequestException(
        `Error al generar RIDE: ${error.message}`,
      );
    }
  }

  /**
   * Genera el RIDE (PDF) para una factura (forzar regeneración)
   * POST /api/sri/ride/:facturaId/generar
   */
  @Post('ride/:facturaId/generar')
  async regenerarRIDE(
    @Param('facturaId', ParseIntPipe) facturaId: number,
    @Res() res: Response,
  ) {
    try {
      await this.rideService.generarRIDE(facturaId);
      const pdfBuffer = await this.rideService.obtenerRIDE(facturaId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="RIDE-${facturaId}.pdf"`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      throw new BadRequestException(
        `Error al generar RIDE: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene información del certificado cargado
   */
  @Get('certificado/info')
  async obtenerInfoCertificado() {
    try {
      const certPath = './certs';
      if (!fs.existsSync(certPath)) {
        throw new NotFoundException('No se encontró ningún certificado cargado');
      }
      const files = fs.readdirSync(certPath).filter(f => (f.endsWith('.p12') || f.endsWith('.p12.enc')) && f.startsWith('certificado-'));

      if (files.length === 0) {
        throw new NotFoundException('No se encontró ningún certificado cargado');
      }

      // Obtener el último certificado cargado (por nombre o fecha)
      const certificadoFile = files.sort().reverse()[0];
      const ruc = certificadoFile.replace('certificado-', '').replace('.p12', '').replace('.enc', '');
      const filePath = path.join(certPath, certificadoFile);

      // Obtener contraseña encriptada
      const passwordEncriptada = await this.firmaElectronicaService.obtenerPasswordEncriptada(ruc);
      if (!passwordEncriptada) {
        throw new NotFoundException('No se encontró la contraseña del certificado');
      }

      // Desencriptar y cargar certificado
      const password = await this.firmaElectronicaService.desencriptarPassword(passwordEncriptada);
      const certificadoInfo = await this.firmaElectronicaService.cargarCertificadoP12(filePath, password, ruc);

      return {
        success: true,
        certificado: {
          ruc: certificadoInfo.ruc,
          razonSocial: certificadoInfo.razonSocial,
          numeroSerie: certificadoInfo.numeroSerie,
          fechaEmision: certificadoInfo.fechaEmision,
          fechaVencimiento: certificadoInfo.fechaVencimiento,
          vigente: this.firmaElectronicaService.verificarVigenciaCertificado(certificadoInfo),
          archivo: certificadoFile,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener información del certificado: ${error.message}`);
    }
  }

  /**
   * Consulta de comprobantes recibidos (Simulación SRI)
   */
  @Get('comprobantes-recibidos')
  async consultarRecibidos(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string
  ) {
    if (!fechaInicio || !fechaFin) {
      // Default: último mes
      const fin = new Date();
      const inicio = new Date();
      inicio.setDate(inicio.getDate() - 30);
      fechaFin = fin.toISOString().split('T')[0];
      fechaInicio = inicio.toISOString().split('T')[0];
    }

    return await this.sriService.consultarComprobantesRecibidos(fechaInicio, fechaFin);
  }

  @Get('comprobantes-recibidos/conteo-pendientes')
  async consultarConteoPendientes() {
    return await this.sriService.consultarConteoPendientes();
  }
}

