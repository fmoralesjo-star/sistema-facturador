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
var FirmaElectronicaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirmaElectronicaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const xades_bes_service_1 = require("./xades-bes.service");
const fs = require("fs");
const path = require("path");
const forge = require("node-forge");
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
let FirmaElectronicaService = FirmaElectronicaService_1 = class FirmaElectronicaService {
    constructor(configService, xadesBesService) {
        this.configService = configService;
        this.xadesBesService = xadesBesService;
        this.logger = new common_1.Logger(FirmaElectronicaService_1.name);
        const vaultKeyEnv = this.configService.get('VAULT_KEY');
        if (!vaultKeyEnv) {
            this.logger.warn('VAULT_KEY no configurada. Usando clave temporal (NO SEGURO EN PRODUCCIÓN)');
            this.vaultKey = Buffer.from('temporary-key-for-development-only-32-bytes!!');
        }
        else {
            this.vaultKey = Buffer.from(vaultKeyEnv, 'hex');
        }
        this.certPath = this.configService.get('SRI_CERTIFICADO_PATH', './certs');
    }
    async cargarCertificadoP12(p12Path, password, rucProvided) {
        try {
            let p12Buffer = fs.readFileSync(p12Path);
            if (p12Path.endsWith('.enc')) {
                p12Buffer = await this.desencriptarBuffer(p12Buffer);
            }
            const p12Der = forge.asn1.fromDer(p12Buffer.toString('binary'));
            const p12Asn1 = forge.pkcs12.pkcs12FromAsn1(p12Der, password);
            const certificados = p12Asn1.getBags({ bagType: forge.pki.oids.certBag });
            const clavesPrivadas = p12Asn1.getBags({
                bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
            });
            if (!certificados[forge.pki.oids.certBag] || certificados[forge.pki.oids.certBag].length === 0) {
                throw new common_1.BadRequestException('No se encontró certificado en el archivo .p12');
            }
            if (!clavesPrivadas[forge.pki.oids.pkcs8ShroudedKeyBag] ||
                clavesPrivadas[forge.pki.oids.pkcs8ShroudedKeyBag].length === 0) {
                throw new common_1.BadRequestException('No se encontró clave privada en el archivo .p12');
            }
            const certificado = certificados[forge.pki.oids.certBag][0].cert;
            const clavePrivada = clavesPrivadas[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
            const subject = certificado.subject;
            let ruc = '';
            try {
                ruc = this.extraerRUC(subject);
            }
            catch (e) {
                if (rucProvided) {
                    this.logger.warn(`No se pudo extraer RUC automáticamente, usando el proporcionado: ${rucProvided}`);
                    ruc = rucProvided;
                }
                else {
                    throw e;
                }
            }
            const razonSocial = certificado.subject.getField('CN')?.value || '';
            const info = {
                ruc,
                razonSocial,
                numeroSerie: certificado.serialNumber,
                fechaEmision: certificado.validity.notBefore,
                fechaVencimiento: certificado.validity.notAfter,
                certificado,
                clavePrivada,
            };
            this.logger.log(`Certificado cargado: ${razonSocial} (RUC: ${ruc})`);
            return info;
        }
        catch (error) {
            this.logger.error('Error al cargar certificado .p12:', error);
            if (error.message.includes('Invalid password') || error.message.includes('MAC verification failed')) {
                throw new common_1.BadRequestException('Contraseña incorrecta para el certificado');
            }
            throw new common_1.BadRequestException(`Error al cargar certificado: ${error.message}`);
        }
    }
    async encriptarBuffer(buffer) {
        const iv = (0, crypto_1.randomBytes)(16);
        const key = await this.getDerivedKey();
        const cipher = (0, crypto_1.createCipheriv)('aes-256-cbc', key, iv);
        const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
        return Buffer.concat([iv, encrypted]);
    }
    async desencriptarBuffer(encryptedBuffer) {
        const iv = encryptedBuffer.subarray(0, 16);
        const content = encryptedBuffer.subarray(16);
        const key = await this.getDerivedKey();
        const decipher = (0, crypto_1.createDecipheriv)('aes-256-cbc', key, iv);
        return Buffer.concat([decipher.update(content), decipher.final()]);
    }
    async guardarArchivoEncriptado(filePath, buffer) {
        const encryptedBuffer = await this.encriptarBuffer(buffer);
        const finalPath = filePath.endsWith('.enc') ? filePath : `${filePath}.enc`;
        fs.writeFileSync(finalPath, encryptedBuffer);
    }
    extraerRUC(subject) {
        const serialNumber = subject.getField('serialNumber')?.value;
        if (serialNumber) {
            return serialNumber;
        }
        const cn = subject.getField('CN')?.value || '';
        const rucMatch = cn.match(/\d{13}/);
        if (rucMatch) {
            return rucMatch[0];
        }
        throw new common_1.BadRequestException('No se pudo extraer el RUC del certificado');
    }
    verificarVigenciaCertificado(info) {
        const ahora = new Date();
        return ahora >= info.fechaEmision && ahora <= info.fechaVencimiento;
    }
    async firmarXML(xmlContent, certificadoInfo) {
        try {
            if (!this.verificarVigenciaCertificado(certificadoInfo)) {
                throw new common_1.BadRequestException('El certificado no está vigente');
            }
            this.logger.log('Firmando XML con XAdES-BES, certificado RUC: ' + certificadoInfo.ruc);
            return this.xadesBesService.firmarXML(xmlContent, certificadoInfo);
        }
        catch (error) {
            this.logger.error('Error al firmar XML:', error);
            throw new common_1.BadRequestException(`Error al firmar XML: ${error.message}`);
        }
    }
    async encriptarPassword(password) {
        const iv = (0, crypto_1.randomBytes)(16);
        const key = await this.getDerivedKey();
        const cipher = (0, crypto_1.createCipheriv)('aes-256-cbc', key, iv);
        let encrypted = cipher.update(password, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    async desencriptarPassword(encryptedPassword) {
        const [ivHex, encrypted] = encryptedPassword.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const key = await this.getDerivedKey();
        const decipher = (0, crypto_1.createDecipheriv)('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    async getDerivedKey() {
        return (await scryptAsync(this.vaultKey, 'salt', 32));
    }
    async guardarPasswordEncriptada(ruc, passwordEncriptada) {
        const vaultPath = path.join(this.certPath, 'vault.json');
        let vault = {};
        if (fs.existsSync(vaultPath)) {
            const vaultContent = fs.readFileSync(vaultPath, 'utf8');
            vault = JSON.parse(vaultContent);
        }
        vault[ruc] = passwordEncriptada;
        if (!fs.existsSync(this.certPath)) {
            fs.mkdirSync(this.certPath, { recursive: true });
        }
        fs.writeFileSync(vaultPath, JSON.stringify(vault, null, 2), {
            mode: 0o600,
        });
        this.logger.log(`Contraseña encriptada guardada para RUC: ${ruc}`);
    }
    async obtenerPasswordEncriptada(ruc) {
        const vaultPath = path.join(this.certPath, 'vault.json');
        if (!fs.existsSync(vaultPath)) {
            return null;
        }
        const vaultContent = fs.readFileSync(vaultPath, 'utf8');
        const vault = JSON.parse(vaultContent);
        return vault[ruc] || null;
    }
};
exports.FirmaElectronicaService = FirmaElectronicaService;
exports.FirmaElectronicaService = FirmaElectronicaService = FirmaElectronicaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        xades_bes_service_1.XadesBesService])
], FirmaElectronicaService);
//# sourceMappingURL=firma-electronica.service.js.map