import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XadesBesService } from './xades-bes.service';
import * as fs from 'fs';
import * as path from 'path';
import * as forge from 'node-forge';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export interface CertificadoInfo {
  ruc: string;
  razonSocial: string;
  numeroSerie: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  certificado: any; // Objeto del certificado
  clavePrivada: any; // Objeto de la clave privada
}

@Injectable()
export class FirmaElectronicaService {
  private readonly logger = new Logger(FirmaElectronicaService.name);
  private readonly vaultKey: Buffer;
  private readonly certPath: string;

  constructor(
    private configService: ConfigService,
    private xadesBesService: XadesBesService,
  ) {
    // La clave del vault se genera o se obtiene de variables de entorno
    // En producción, esto debe estar en un key management system
    const vaultKeyEnv = this.configService.get('VAULT_KEY');
    if (!vaultKeyEnv) {
      this.logger.warn('VAULT_KEY no configurada. Usando clave temporal (NO SEGURO EN PRODUCCIÓN)');
      this.vaultKey = Buffer.from('temporary-key-for-development-only-32-bytes!!');
    } else {
      this.vaultKey = Buffer.from(vaultKeyEnv, 'hex');
    }

    this.certPath = this.configService.get('SRI_CERTIFICADO_PATH', './certs');
  }

  /**
   * Carga un certificado .p12 y extrae la información
   * @param p12Path Ruta al archivo .p12
   * @param password Contraseña del certificado (encriptada en memoria)
   */
  async cargarCertificadoP12(
    p12Path: string,
    password: string,
    rucProvided?: string,
  ): Promise<CertificadoInfo> {
    try {
      // Leer archivo .p12
      let p12Buffer: any = fs.readFileSync(p12Path);

      // Intentar detectar si está encriptado (si termina en .enc)
      if (p12Path.endsWith('.enc')) {
        p12Buffer = await this.desencriptarBuffer(p12Buffer);
      }

      const p12Der = forge.asn1.fromDer(p12Buffer.toString('binary'));
      const p12Asn1 = forge.pkcs12.pkcs12FromAsn1(p12Der, password);

      // Extraer certificado y clave privada
      const certificados = p12Asn1.getBags({ bagType: forge.pki.oids.certBag });
      const clavesPrivadas = p12Asn1.getBags({
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
      });

      if (!certificados[forge.pki.oids.certBag] || certificados[forge.pki.oids.certBag].length === 0) {
        throw new BadRequestException('No se encontró certificado en el archivo .p12');
      }

      if (!clavesPrivadas[forge.pki.oids.pkcs8ShroudedKeyBag] ||
        clavesPrivadas[forge.pki.oids.pkcs8ShroudedKeyBag].length === 0) {
        throw new BadRequestException('No se encontró clave privada en el archivo .p12');
      }

      const certificado = certificados[forge.pki.oids.certBag][0].cert;
      const clavePrivada = clavesPrivadas[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;

      // Extraer información del certificado
      const subject = certificado.subject;
      let ruc = '';

      try {
        ruc = this.extraerRUC(subject);
      } catch (e) {
        if (rucProvided) {
          this.logger.warn(`No se pudo extraer RUC automáticamente, usando el proporcionado: ${rucProvided}`);
          ruc = rucProvided;
        } else {
          throw e; // Relanzar si no hay fallback
        }
      }

      const razonSocial = certificado.subject.getField('CN')?.value || '';

      const info: CertificadoInfo = {
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
    } catch (error) {
      this.logger.error('Error al cargar certificado .p12:', error);
      // Mejorar el mensaje de error para el usuario
      if (error.message.includes('Invalid password') || error.message.includes('MAC verification failed')) {
        throw new BadRequestException('Contraseña incorrecta para el certificado');
      }
      throw new BadRequestException(
        `Error al cargar certificado: ${error.message}`,
      );
    }
  }

  /**
   * Encripta un buffer usando AES-256
   */
  async encriptarBuffer(buffer: Buffer): Promise<Buffer> {
    const iv = randomBytes(16);
    const key = await this.getDerivedKey();
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    // Prepend IV to the encrypted buffer
    return Buffer.concat([iv, encrypted]);
  }

  /**
   * Desencripta un buffer usando AES-256
   */
  async desencriptarBuffer(encryptedBuffer: Buffer): Promise<Buffer> {
    const iv = encryptedBuffer.subarray(0, 16);
    const content = encryptedBuffer.subarray(16);
    const key = await this.getDerivedKey();

    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(content), decipher.final()]);
  }

  /**
   * Guarda un archivo encriptado en disco
   */
  async guardarArchivoEncriptado(filePath: string, buffer: Buffer): Promise<void> {
    const encryptedBuffer = await this.encriptarBuffer(buffer);
    // Asegurar extensión .enc
    const finalPath = filePath.endsWith('.enc') ? filePath : `${filePath}.enc`;
    fs.writeFileSync(finalPath, encryptedBuffer);
  }

  /**
   * Extrae el RUC del subject del certificado
   */
  private extraerRUC(subject: any): string {
    // El RUC puede estar en diferentes campos del certificado
    const serialNumber = subject.getField('serialNumber')?.value;
    if (serialNumber) {
      return serialNumber;
    }

    // Intentar extraer de CN o otros campos
    const cn = subject.getField('CN')?.value || '';
    const rucMatch = cn.match(/\d{13}/);
    if (rucMatch) {
      return rucMatch[0];
    }

    throw new BadRequestException('No se pudo extraer el RUC del certificado');
  }

  /**
   * Verifica que el certificado esté vigente
   */
  verificarVigenciaCertificado(info: CertificadoInfo): boolean {
    const ahora = new Date();
    return ahora >= info.fechaEmision && ahora <= info.fechaVencimiento;
  }

  /**
   * Firma un XML usando el certificado cargado según XAdES-BES
   * @param xmlContent Contenido XML a firmar
   * @param certificadoInfo Información del certificado
   */
  async firmarXML(
    xmlContent: string,
    certificadoInfo: CertificadoInfo,
  ): Promise<string> {
    try {
      // Verificar vigencia
      if (!this.verificarVigenciaCertificado(certificadoInfo)) {
        throw new BadRequestException('El certificado no está vigente');
      }

      this.logger.log(
        'Firmando XML con XAdES-BES, certificado RUC: ' + certificadoInfo.ruc,
      );

      // Usar el servicio XAdES-BES para firmar
      return this.xadesBesService.firmarXML(xmlContent, certificadoInfo);
    } catch (error) {
      this.logger.error('Error al firmar XML:', error);
      throw new BadRequestException(`Error al firmar XML: ${error.message}`);
    }
  }

  /**
   * Encripta la contraseña del certificado usando AES-256
   */
  async encriptarPassword(password: string): Promise<string> {
    const iv = randomBytes(16);
    const key = await this.getDerivedKey();

    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retornar IV + contraseña encriptada
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Desencripta la contraseña del certificado
   */
  async desencriptarPassword(encryptedPassword: string): Promise<string> {
    const [ivHex, encrypted] = encryptedPassword.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = await this.getDerivedKey();

    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Deriva una clave de 32 bytes desde la clave del vault
   */
  private async getDerivedKey(): Promise<Buffer> {
    return (await scryptAsync(this.vaultKey, 'salt', 32)) as Buffer;
  }

  /**
   * Guarda la contraseña encriptada en el vault
   * En producción, esto debería ir a un sistema de gestión de secretos
   */
  async guardarPasswordEncriptada(ruc: string, passwordEncriptada: string): Promise<void> {
    const vaultPath = path.join(this.certPath, 'vault.json');

    let vault: Record<string, string> = {};
    if (fs.existsSync(vaultPath)) {
      const vaultContent = fs.readFileSync(vaultPath, 'utf8');
      vault = JSON.parse(vaultContent);
    }

    vault[ruc] = passwordEncriptada;

    // Asegurar que el directorio existe
    if (!fs.existsSync(this.certPath)) {
      fs.mkdirSync(this.certPath, { recursive: true });
    }

    fs.writeFileSync(vaultPath, JSON.stringify(vault, null, 2), {
      mode: 0o600, // Solo lectura para el propietario
    });

    this.logger.log(`Contraseña encriptada guardada para RUC: ${ruc}`);
  }

  /**
   * Obtiene la contraseña encriptada del vault
   */
  async obtenerPasswordEncriptada(ruc: string): Promise<string | null> {
    const vaultPath = path.join(this.certPath, 'vault.json');

    if (!fs.existsSync(vaultPath)) {
      return null;
    }

    const vaultContent = fs.readFileSync(vaultPath, 'utf8');
    const vault: Record<string, string> = JSON.parse(vaultContent);

    return vault[ruc] || null;
  }
}

