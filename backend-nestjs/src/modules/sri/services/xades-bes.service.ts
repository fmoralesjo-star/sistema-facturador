import { Injectable, Logger } from '@nestjs/common';
import * as forge from 'node-forge';
import * as crypto from 'crypto';
import { DOMParser, XMLSerializer } from 'xmldom';

export interface CertificadoInfo {
  ruc: string;
  razonSocial: string;
  numeroSerie: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  certificado: any;
  clavePrivada: any;
}

@Injectable()
export class XadesBesService {
  private readonly logger = new Logger(XadesBesService.name);

  /**
   * Firma un XML usando el estándar XAdES-BES
   */
  async firmarXML(
    xmlContent: string,
    certificadoInfo: CertificadoInfo,
  ): Promise<string> {
    try {
      this.logger.log('Iniciando firma XAdES-BES...');

      // Parsear XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      // Crear el elemento Signature
      const signature = this.crearElementoSignature(xmlDoc, certificadoInfo);

      // Calcular digest del documento
      const digestValue = await this.calcularDigest(xmlContent);

      // PRIMERO crear el Object con SignedProperties para calcular su digest
      const object = this.crearObjectWithSignedProperties(
        xmlDoc,
        certificadoInfo,
      );
      
      // Calcular digest de SignedProperties (debe hacerse sobre el XML canonicalizado)
      const signedPropertiesXML = new XMLSerializer().serializeToString(
        object.getElementsByTagName('xades:SignedProperties')[0] || object.firstChild
      );
      const signedPropertiesDigest = await this.calcularDigest(signedPropertiesXML);

      // Ahora crear SignedInfo con ambos digests
      const signedInfo = this.crearSignedInfo(
        xmlDoc,
        digestValue,
        signedPropertiesDigest,
        certificadoInfo,
      );

      // Firmar el SignedInfo (canonicalizado)
      const signedInfoString = new XMLSerializer().serializeToString(signedInfo);
      const canonicalizedSignedInfo = this.canonicalizarXML(signedInfoString);
      const signatureValue = await this.firmarSignedInfo(
        canonicalizedSignedInfo,
        certificadoInfo.clavePrivada,
      );

      // Agregar SignedInfo a signature
      signature.appendChild(signedInfo);

      // Agregar SignatureValue (después de SignedInfo)
      const signatureValueElem = xmlDoc.createElementNS(
        'http://www.w3.org/2000/09/xmldsig#',
        'ds:SignatureValue',
      );
      signatureValueElem.textContent = signatureValue;
      signature.appendChild(signatureValueElem);

      // Agregar KeyInfo con el certificado
      const keyInfo = this.crearKeyInfo(xmlDoc, certificadoInfo);
      signature.appendChild(keyInfo);

      // Agregar Object con SignedProperties (XAdES-BES) - ya fue creado arriba
      signature.appendChild(object);

      // Insertar Signature en el XML
      const rootElement = xmlDoc.documentElement;
      rootElement.appendChild(signature);

      // Agregar namespaces necesarios
      rootElement.setAttribute(
        'xmlns:ds',
        'http://www.w3.org/2000/09/xmldsig#',
      );
      rootElement.setAttribute(
        'xmlns:xades',
        'http://uri.etsi.org/01903/v1.3.2#',
      );

      const signedXML = new XMLSerializer().serializeToString(xmlDoc);

      this.logger.log('Firma XAdES-BES completada');
      return signedXML;
    } catch (error) {
      this.logger.error('Error al firmar XML con XAdES-BES:', error);
      throw error;
    }
  }

  /**
   * Crea el elemento Signature base
   */
  private crearElementoSignature(
    doc: any,
    certificadoInfo: CertificadoInfo,
  ): any {
    const signature = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:Signature',
    );
    signature.setAttribute('Id', 'Signature' + Date.now());
    return signature;
  }

  /**
   * Crea el elemento SignedInfo con las referencias
   */
  private crearSignedInfo(
    doc: any,
    digestValue: string,
    signedPropertiesDigest: string,
    certificadoInfo: CertificadoInfo,
  ): any {
    const signedInfo = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:SignedInfo',
    );

    // CanonicalizationMethod
    const canonicalizationMethod = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:CanonicalizationMethod',
    );
    canonicalizationMethod.setAttribute(
      'Algorithm',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    );
    signedInfo.appendChild(canonicalizationMethod);

    // SignatureMethod
    const signatureMethod = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:SignatureMethod',
    );
    signatureMethod.setAttribute(
      'Algorithm',
      'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    );
    signedInfo.appendChild(signatureMethod);

    // Reference al documento
    const reference = this.crearReference(doc, digestValue, 'comprobante');
    signedInfo.appendChild(reference);

    // Reference a SignedProperties
    const referenceSignedProps = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:Reference',
    );
    referenceSignedProps.setAttribute('URI', '#SignedProperties');
    referenceSignedProps.setAttribute('Type', 'http://uri.etsi.org/01903#SignedProperties');
    
    // DigestMethod para SignedProperties
    const digestMethodSP = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:DigestMethod',
    );
    digestMethodSP.setAttribute(
      'Algorithm',
      'http://www.w3.org/2000/09/xmldsig#sha1',
    );
    referenceSignedProps.appendChild(digestMethodSP);

    // DigestValue para SignedProperties
    const digestValueSP = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:DigestValue',
    );
    digestValueSP.textContent = signedPropertiesDigest;
    referenceSignedProps.appendChild(digestValueSP);
    
    signedInfo.appendChild(referenceSignedProps);

    return signedInfo;
  }

  /**
   * Crea un elemento Reference
   */
  private crearReference(
    doc: any,
    digestValue: string,
    uri: string,
  ): any {
    const reference = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:Reference',
    );
    reference.setAttribute('URI', '#' + uri);

    // Transforms
    const transforms = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:Transforms',
    );
    const transform = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:Transform',
    );
    transform.setAttribute(
      'Algorithm',
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
    );
    transforms.appendChild(transform);
    reference.appendChild(transforms);

    // DigestMethod
    const digestMethod = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:DigestMethod',
    );
    digestMethod.setAttribute(
      'Algorithm',
      'http://www.w3.org/2000/09/xmldsig#sha1',
    );
    reference.appendChild(digestMethod);

    // DigestValue
    const digestValueElem = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:DigestValue',
    );
    digestValueElem.textContent = digestValue;
    reference.appendChild(digestValueElem);

    return reference;
  }

  /**
   * Crea el elemento KeyInfo con el certificado
   */
  private crearKeyInfo(doc: any, certificadoInfo: CertificadoInfo): any {
    const keyInfo = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:KeyInfo',
    );

    // X509Data
    const x509Data = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:X509Data',
    );

    // X509Certificate
    const x509Certificate = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:X509Certificate',
    );

    // Convertir certificado a PEM y extraer solo el contenido base64
    const certPem = forge.pki.certificateToPem(certificadoInfo.certificado);
    const certBase64 = certPem
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/\r?\n/g, '');

    x509Certificate.textContent = certBase64;
    x509Data.appendChild(x509Certificate);
    keyInfo.appendChild(x509Data);

    return keyInfo;
  }

  /**
   * Crea el elemento Object con SignedProperties (XAdES-BES)
   */
  private crearObjectWithSignedProperties(
    doc: any,
    certificadoInfo: CertificadoInfo,
  ): any {
    const object = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:Object',
    );

    // QualifyingProperties
    const qualifyingProperties = doc.createElementNS(
      'http://uri.etsi.org/01903/v1.3.2#',
      'xades:QualifyingProperties',
    );
    qualifyingProperties.setAttribute('Target', '#comprobante');

    // SignedProperties
    const signedProperties = doc.createElementNS(
      'http://uri.etsi.org/01903/v1.3.2#',
      'xades:SignedProperties',
    );
    signedProperties.setAttribute('Id', 'SignedProperties');

    // SignedSignatureProperties
    const signedSignatureProperties = doc.createElementNS(
      'http://uri.etsi.org/01903/v1.3.2#',
      'xades:SignedSignatureProperties',
    );

    // SigningTime (Timestamp)
    const signingTime = doc.createElementNS(
      'http://uri.etsi.org/01903/v1.3.2#',
      'xades:SigningTime',
    );
    signingTime.textContent = new Date().toISOString();
    signedSignatureProperties.appendChild(signingTime);

    // SigningCertificate
    const signingCertificate = this.crearSigningCertificate(
      doc,
      certificadoInfo,
    );
    signedSignatureProperties.appendChild(signingCertificate);

    signedProperties.appendChild(signedSignatureProperties);
    qualifyingProperties.appendChild(signedProperties);
    object.appendChild(qualifyingProperties);

    return object;
  }

  /**
   * Crea el elemento SigningCertificate
   */
  private crearSigningCertificate(
    doc: any,
    certificadoInfo: CertificadoInfo,
  ): any {
    const signingCertificate = doc.createElementNS(
      'http://uri.etsi.org/01903/v1.3.2#',
      'xades:SigningCertificate',
    );

    // Cert
    const cert = doc.createElementNS(
      'http://uri.etsi.org/01903/v1.3.2#',
      'xades:Cert',
    );

    // CertDigest
    const certDigest = doc.createElementNS(
      'http://uri.etsi.org/01903/v1.3.2#',
      'xades:CertDigest',
    );

    // DigestMethod
    const digestMethod = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:DigestMethod',
    );
    digestMethod.setAttribute(
      'Algorithm',
      'http://www.w3.org/2000/09/xmldsig#sha1',
    );
    certDigest.appendChild(digestMethod);

    // DigestValue del certificado
    const certPem = forge.pki.certificateToPem(certificadoInfo.certificado);
    const certDer = forge.asn1.toDer(
      forge.pki.certificateToAsn1(certificadoInfo.certificado),
    ).getBytes();
    const certDigestValue = crypto.createHash('sha1').update(certDer, 'binary').digest('base64');

    const digestValue = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:DigestValue',
    );
    digestValue.textContent = certDigestValue;
    certDigest.appendChild(digestValue);

    cert.appendChild(certDigest);

    // IssuerSerial
    const issuerSerial = doc.createElementNS(
      'http://uri.etsi.org/01903/v1.3.2#',
      'xades:IssuerSerial',
    );

    // X509IssuerName
    const x509IssuerName = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:X509IssuerName',
    );
    const issuer = certificadoInfo.certificado.issuer;
    x509IssuerName.textContent = this.obtenerDNString(issuer);
    issuerSerial.appendChild(x509IssuerName);

    // X509SerialNumber
    const x509SerialNumber = doc.createElementNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'ds:X509SerialNumber',
    );
    x509SerialNumber.textContent = certificadoInfo.certificado.serialNumber;
    issuerSerial.appendChild(x509SerialNumber);

    cert.appendChild(issuerSerial);
    signingCertificate.appendChild(cert);

    return signingCertificate;
  }

  /**
   * Convierte un DN (Distinguished Name) a string
   */
  private obtenerDNString(dn: any): string {
    const parts: string[] = [];
    for (let i = 0; i < dn.attributes.length; i++) {
      const attr = dn.attributes[i];
      parts.push(`${attr.shortName || attr.name}=${attr.value}`);
    }
    return parts.join(', ');
  }

  /**
   * Calcula el digest SHA1 del contenido XML
   */
  private async calcularDigest(content: string): Promise<string> {
    const canonicalized = this.canonicalizarXML(content);
    const hash = crypto.createHash('sha1');
    hash.update(canonicalized, 'utf8');
    return hash.digest('base64');
  }

  /**
   * Calcula el digest de SignedProperties
   * Nota: En implementación completa, esto debe calcularse sobre el XML canonicalizado
   * de SignedProperties antes de insertarlo en el documento
   */
  private async calcularDigestSignedProperties(
    certificadoInfo: CertificadoInfo,
  ): Promise<string> {
    // Crear una representación temporal de SignedProperties para calcular su digest
    // En producción, usar una librería de canonicalización XML apropiada
    const timestamp = new Date().toISOString();
    const certSerial = certificadoInfo.numeroSerie;
    
    // Contenido básico que representa SignedProperties
    const content = `SignedProperties${certSerial}${timestamp}`;
    return crypto.createHash('sha1').update(content, 'utf8').digest('base64');
  }

  /**
   * Canonicaliza XML según XML C14N
   */
  private canonicalizarXML(xml: string): string {
    // Implementación básica de canonicalización
    // En producción, usar una librería como xml-c14n
    // Por ahora, retornamos el XML sin espacios extra
    return xml
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\s+/g, '\n')
      .trim();
  }

  /**
   * Firma el SignedInfo usando la clave privada RSA-SHA1
   */
  private async firmarSignedInfo(
    canonicalizedSignedInfo: string,
    privateKey: any,
  ): Promise<string> {
    try {
      // Crear hash SHA1 del contenido canonicalizado
      const md = forge.md.sha1.create();
      md.update(canonicalizedSignedInfo, 'utf8');
      
      // Firmar con la clave privada
      // La clave privada viene como objeto forge.pki.rsa.PrivateKey
      const signatureBytes = privateKey.sign(md);

      // Convertir a base64
      return forge.util.encode64(signatureBytes);
    } catch (error) {
      this.logger.error('Error al firmar SignedInfo:', error);
      throw error;
    }
  }

  /**
   * Obtiene el elemento SignedProperties del Object
   */
  private obtenerSignedPropertiesElement(object: any): any {
    // Buscar xades:SignedProperties dentro del Object
    const signedProps = object.getElementsByTagNameNS(
      'http://uri.etsi.org/01903/v1.3.2#',
      'SignedProperties'
    );
    if (signedProps && signedProps.length > 0) {
      return signedProps[0];
    }
    // Fallback: buscar por nombre local
    const allElements = object.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const elem = allElements[i];
      if (elem.localName === 'SignedProperties' || elem.nodeName.includes('SignedProperties')) {
        return elem;
      }
    }
    return object.firstChild; // Último recurso
  }
}

