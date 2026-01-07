# Servicios SRI

## FirmaElectronicaService

Gestiona certificados .p12 y firma de documentos XML.

### Características
- ✅ Carga de certificados .p12
- ✅ Extracción de certificado y clave privada
- ✅ Vault de seguridad con encriptación AES-256
- ✅ Validación de vigencia de certificados
- ⏳ Firma XML según XMLDSig (pendiente implementación completa)

### Uso

```typescript
// Cargar certificado
const certInfo = await firmaElectronicaService.cargarCertificadoP12(
  './certs/certificado.p12',
  'password'
);

// Verificar vigencia
const vigente = firmaElectronicaService.verificarVigenciaCertificado(certInfo);

// Encriptar contraseña
const passwordEncriptada = await firmaElectronicaService.encriptarPassword('password');

// Guardar en vault
await firmaElectronicaService.guardarPasswordEncriptada('1234567890001', passwordEncriptada);

// Firmar XML
const xmlFirmado = await firmaElectronicaService.firmarXML(xmlContent, certInfo);
```

## XmlGeneratorService

Genera XML según esquema XSD del SRI v2.1.0.

### Características
- ✅ Generación de clave de acceso (49 dígitos)
- ✅ Cálculo de dígito verificador (Módulo 11)
- ✅ Construcción de XML completo
- ✅ Validación básica de XML

### Uso

```typescript
// Generar XML
const xml = await xmlGeneratorService.generarXMLFactura(factura);

// Generar clave de acceso
const claveAcceso = xmlGeneratorService.generarClaveAcceso(factura);

// Validar XML
const esValido = xmlGeneratorService.validarXML(xml);
```

## Estructura del XML Generado

```xml
<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.1.0">
  <infoTributaria>
    <ambiente>2</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>...</razonSocial>
    <ruc>...</ruc>
    <claveAcceso>...</claveAcceso>
    ...
  </infoTributaria>
  <infoFactura>
    ...
  </infoFactura>
  <detalles>
    ...
  </detalles>
</factura>
```


















