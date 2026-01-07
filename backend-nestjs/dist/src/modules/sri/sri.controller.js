"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SriController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const sri_service_1 = require("./sri.service");
const firma_electronica_service_1 = require("./services/firma-electronica.service");
const ride_service_1 = require("./services/ride.service");
const upload_certificado_dto_1 = require("./dto/upload-certificado.dto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
let SriController = class SriController {
    constructor(sriService, firmaElectronicaService, rideService) {
        this.sriService = sriService;
        this.firmaElectronicaService = firmaElectronicaService;
        this.rideService = rideService;
    }
    async uploadCertificado(file, uploadDto) {
        if (!file) {
            throw new common_1.BadRequestException('No se proporcionó archivo');
        }
        try {
            const certificadoInfo = await this.firmaElectronicaService.cargarCertificadoP12(file.path, uploadDto.password, uploadDto.ruc);
            const passwordEncriptada = await this.firmaElectronicaService.encriptarPassword(uploadDto.password);
            await this.firmaElectronicaService.guardarPasswordEncriptada(uploadDto.ruc, passwordEncriptada);
            const nuevoPath = path.join(path.dirname(file.path), `certificado-${uploadDto.ruc}.p12`);
            const fileBuffer = fs.readFileSync(file.path);
            await this.firmaElectronicaService.guardarArchivoEncriptado(nuevoPath, fileBuffer);
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
        }
        catch (error) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw error;
        }
    }
    async generarRIDE(facturaId, res) {
        try {
            const pdfBuffer = await this.rideService.obtenerRIDE(facturaId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="RIDE-${facturaId}.pdf"`);
            res.send(pdfBuffer);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al generar RIDE: ${error.message}`);
        }
    }
    async regenerarRIDE(facturaId, res) {
        try {
            await this.rideService.generarRIDE(facturaId);
            const pdfBuffer = await this.rideService.obtenerRIDE(facturaId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="RIDE-${facturaId}.pdf"`);
            res.send(pdfBuffer);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al generar RIDE: ${error.message}`);
        }
    }
    async obtenerInfoCertificado() {
        try {
            const certPath = './certs';
            if (!fs.existsSync(certPath)) {
                throw new common_1.NotFoundException('No se encontró ningún certificado cargado');
            }
            const files = fs.readdirSync(certPath).filter(f => (f.endsWith('.p12') || f.endsWith('.p12.enc')) && f.startsWith('certificado-'));
            if (files.length === 0) {
                throw new common_1.NotFoundException('No se encontró ningún certificado cargado');
            }
            const certificadoFile = files.sort().reverse()[0];
            const ruc = certificadoFile.replace('certificado-', '').replace('.p12', '').replace('.enc', '');
            const filePath = path.join(certPath, certificadoFile);
            const passwordEncriptada = await this.firmaElectronicaService.obtenerPasswordEncriptada(ruc);
            if (!passwordEncriptada) {
                throw new common_1.NotFoundException('No se encontró la contraseña del certificado');
            }
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Error al obtener información del certificado: ${error.message}`);
        }
    }
    async consultarRecibidos(fechaInicio, fechaFin) {
        if (!fechaInicio || !fechaFin) {
            const fin = new Date();
            const inicio = new Date();
            inicio.setDate(inicio.getDate() - 30);
            fechaFin = fin.toISOString().split('T')[0];
            fechaInicio = inicio.toISOString().split('T')[0];
        }
        return await this.sriService.consultarComprobantesRecibidos(fechaInicio, fechaFin);
    }
    async consultarConteoPendientes() {
        return await this.sriService.consultarConteoPendientes();
    }
};
exports.SriController = SriController;
__decorate([
    (0, common_1.Post)('certificado/upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
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
            }
            else {
                cb(new Error('Solo se permiten archivos .p12'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_certificado_dto_1.UploadCertificadoDto]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "uploadCertificado", null);
__decorate([
    (0, common_1.Get)('ride/:facturaId'),
    __param(0, (0, common_1.Param)('facturaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "generarRIDE", null);
__decorate([
    (0, common_1.Post)('ride/:facturaId/generar'),
    __param(0, (0, common_1.Param)('facturaId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "regenerarRIDE", null);
__decorate([
    (0, common_1.Get)('certificado/info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SriController.prototype, "obtenerInfoCertificado", null);
__decorate([
    (0, common_1.Get)('comprobantes-recibidos'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SriController.prototype, "consultarRecibidos", null);
__decorate([
    (0, common_1.Get)('comprobantes-recibidos/conteo-pendientes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SriController.prototype, "consultarConteoPendientes", null);
exports.SriController = SriController = __decorate([
    (0, common_1.Controller)('sri'),
    __metadata("design:paramtypes", [sri_service_1.SriService,
        firma_electronica_service_1.FirmaElectronicaService,
        ride_service_1.RideService])
], SriController);
//# sourceMappingURL=sri.controller.js.map