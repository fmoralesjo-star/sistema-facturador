"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var XadesBesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XadesBesService = void 0;
const common_1 = require("@nestjs/common");
const forge = require("node-forge");
const crypto = require("crypto");
const xmldom_1 = require("xmldom");
let XadesBesService = XadesBesService_1 = class XadesBesService {
    constructor() {
        this.logger = new common_1.Logger(XadesBesService_1.name);
    }
    async firmarXML(xmlContent, certificadoInfo) {
        try {
            this.logger.log('Iniciando firma XAdES-BES...');
            const parser = new xmldom_1.DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
            const signature = this.crearElementoSignature(xmlDoc, certificadoInfo);
            const digestValue = await this.calcularDigest(xmlContent);
            const object = this.crearObjectWithSignedProperties(xmlDoc, certificadoInfo);
            const signedPropertiesXML = new xmldom_1.XMLSerializer().serializeToString(object.getElementsByTagName('xades:SignedProperties')[0] || object.firstChild);
            const signedPropertiesDigest = await this.calcularDigest(signedPropertiesXML);
            const signedInfo = this.crearSignedInfo(xmlDoc, digestValue, signedPropertiesDigest, certificadoInfo);
            const signedInfoString = new xmldom_1.XMLSerializer().serializeToString(signedInfo);
            const canonicalizedSignedInfo = this.canonicalizarXML(signedInfoString);
            const signatureValue = await this.firmarSignedInfo(canonicalizedSignedInfo, certificadoInfo.clavePrivada);
            signature.appendChild(signedInfo);
            const signatureValueElem = xmlDoc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:SignatureValue');
            signatureValueElem.textContent = signatureValue;
            signature.appendChild(signatureValueElem);
            const keyInfo = this.crearKeyInfo(xmlDoc, certificadoInfo);
            signature.appendChild(keyInfo);
            signature.appendChild(object);
            const rootElement = xmlDoc.documentElement;
            rootElement.appendChild(signature);
            rootElement.setAttribute('xmlns:ds', 'http://www.w3.org/2000/09/xmldsig#');
            rootElement.setAttribute('xmlns:xades', 'http://uri.etsi.org/01903/v1.3.2#');
            const signedXML = new xmldom_1.XMLSerializer().serializeToString(xmlDoc);
            this.logger.log('Firma XAdES-BES completada');
            return signedXML;
        }
        catch (error) {
            this.logger.error('Error al firmar XML con XAdES-BES:', error);
            throw error;
        }
    }
    crearElementoSignature(doc, certificadoInfo) {
        const signature = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Signature');
        signature.setAttribute('Id', 'Signature' + Date.now());
        return signature;
    }
    crearSignedInfo(doc, digestValue, signedPropertiesDigest, certificadoInfo) {
        const signedInfo = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:SignedInfo');
        const canonicalizationMethod = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:CanonicalizationMethod');
        canonicalizationMethod.setAttribute('Algorithm', 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315');
        signedInfo.appendChild(canonicalizationMethod);
        const signatureMethod = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:SignatureMethod');
        signatureMethod.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#rsa-sha1');
        signedInfo.appendChild(signatureMethod);
        const reference = this.crearReference(doc, digestValue, 'comprobante');
        signedInfo.appendChild(reference);
        const referenceSignedProps = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Reference');
        referenceSignedProps.setAttribute('URI', '#SignedProperties');
        referenceSignedProps.setAttribute('Type', 'http://uri.etsi.org/01903#SignedProperties');
        const digestMethodSP = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:DigestMethod');
        digestMethodSP.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#sha1');
        referenceSignedProps.appendChild(digestMethodSP);
        const digestValueSP = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:DigestValue');
        digestValueSP.textContent = signedPropertiesDigest;
        referenceSignedProps.appendChild(digestValueSP);
        signedInfo.appendChild(referenceSignedProps);
        return signedInfo;
    }
    crearReference(doc, digestValue, uri) {
        const reference = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Reference');
        reference.setAttribute('URI', '#' + uri);
        const transforms = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Transforms');
        const transform = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Transform');
        transform.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#enveloped-signature');
        transforms.appendChild(transform);
        reference.appendChild(transforms);
        const digestMethod = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:DigestMethod');
        digestMethod.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#sha1');
        reference.appendChild(digestMethod);
        const digestValueElem = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:DigestValue');
        digestValueElem.textContent = digestValue;
        reference.appendChild(digestValueElem);
        return reference;
    }
    crearKeyInfo(doc, certificadoInfo) {
        const keyInfo = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:KeyInfo');
        const x509Data = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:X509Data');
        const x509Certificate = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:X509Certificate');
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
    crearObjectWithSignedProperties(doc, certificadoInfo) {
        const object = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Object');
        const qualifyingProperties = doc.createElementNS('http://uri.etsi.org/01903/v1.3.2#', 'xades:QualifyingProperties');
        qualifyingProperties.setAttribute('Target', '#comprobante');
        const signedProperties = doc.createElementNS('http://uri.etsi.org/01903/v1.3.2#', 'xades:SignedProperties');
        signedProperties.setAttribute('Id', 'SignedProperties');
        const signedSignatureProperties = doc.createElementNS('http://uri.etsi.org/01903/v1.3.2#', 'xades:SignedSignatureProperties');
        const signingTime = doc.createElementNS('http://uri.etsi.org/01903/v1.3.2#', 'xades:SigningTime');
        signingTime.textContent = new Date().toISOString();
        signedSignatureProperties.appendChild(signingTime);
        const signingCertificate = this.crearSigningCertificate(doc, certificadoInfo);
        signedSignatureProperties.appendChild(signingCertificate);
        signedProperties.appendChild(signedSignatureProperties);
        qualifyingProperties.appendChild(signedProperties);
        object.appendChild(qualifyingProperties);
        return object;
    }
    crearSigningCertificate(doc, certificadoInfo) {
        const signingCertificate = doc.createElementNS('http://uri.etsi.org/01903/v1.3.2#', 'xades:SigningCertificate');
        const cert = doc.createElementNS('http://uri.etsi.org/01903/v1.3.2#', 'xades:Cert');
        const certDigest = doc.createElementNS('http://uri.etsi.org/01903/v1.3.2#', 'xades:CertDigest');
        const digestMethod = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:DigestMethod');
        digestMethod.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#sha1');
        certDigest.appendChild(digestMethod);
        const certPem = forge.pki.certificateToPem(certificadoInfo.certificado);
        const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificadoInfo.certificado)).getBytes();
        const certDigestValue = crypto.createHash('sha1').update(certDer, 'binary').digest('base64');
        const digestValue = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:DigestValue');
        digestValue.textContent = certDigestValue;
        certDigest.appendChild(digestValue);
        cert.appendChild(certDigest);
        const issuerSerial = doc.createElementNS('http://uri.etsi.org/01903/v1.3.2#', 'xades:IssuerSerial');
        const x509IssuerName = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:X509IssuerName');
        const issuer = certificadoInfo.certificado.issuer;
        x509IssuerName.textContent = this.obtenerDNString(issuer);
        issuerSerial.appendChild(x509IssuerName);
        const x509SerialNumber = doc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:X509SerialNumber');
        x509SerialNumber.textContent = certificadoInfo.certificado.serialNumber;
        issuerSerial.appendChild(x509SerialNumber);
        cert.appendChild(issuerSerial);
        signingCertificate.appendChild(cert);
        return signingCertificate;
    }
    obtenerDNString(dn) {
        const parts = [];
        for (let i = 0; i < dn.attributes.length; i++) {
            const attr = dn.attributes[i];
            parts.push(`${attr.shortName || attr.name}=${attr.value}`);
        }
        return parts.join(', ');
    }
    async calcularDigest(content) {
        const canonicalized = this.canonicalizarXML(content);
        const hash = crypto.createHash('sha1');
        hash.update(canonicalized, 'utf8');
        return hash.digest('base64');
    }
    async calcularDigestSignedProperties(certificadoInfo) {
        const timestamp = new Date().toISOString();
        const certSerial = certificadoInfo.numeroSerie;
        const content = `SignedProperties${certSerial}${timestamp}`;
        return crypto.createHash('sha1').update(content, 'utf8').digest('base64');
    }
    canonicalizarXML(xml) {
        return xml
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n\s+/g, '\n')
            .trim();
    }
    async firmarSignedInfo(canonicalizedSignedInfo, privateKey) {
        try {
            const md = forge.md.sha1.create();
            md.update(canonicalizedSignedInfo, 'utf8');
            const signatureBytes = privateKey.sign(md);
            return forge.util.encode64(signatureBytes);
        }
        catch (error) {
            this.logger.error('Error al firmar SignedInfo:', error);
            throw error;
        }
    }
    obtenerSignedPropertiesElement(object) {
        const signedProps = object.getElementsByTagNameNS('http://uri.etsi.org/01903/v1.3.2#', 'SignedProperties');
        if (signedProps && signedProps.length > 0) {
            return signedProps[0];
        }
        const allElements = object.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
            const elem = allElements[i];
            if (elem.localName === 'SignedProperties' || elem.nodeName.includes('SignedProperties')) {
                return elem;
            }
        }
        return object.firstChild;
    }
};
exports.XadesBesService = XadesBesService;
exports.XadesBesService = XadesBesService = XadesBesService_1 = __decorate([
    (0, common_1.Injectable)()
], XadesBesService);
//# sourceMappingURL=xades-bes.service.js.map