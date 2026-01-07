# Implementación XAdES-BES - Guía de Uso

## Resumen

Se ha implementado el firmado XAdES-BES completo con todos los elementos requeridos por el SRI:

✅ **KeyInfo** - Información del certificado (X509Certificate)
✅ **SignedProperties** - Propiedades firmadas con timestamp
✅ **Digest del documento** - SHA1 del XML canonicalizado
✅ **SignatureValue** - Firma RSA-SHA1 del SignedInfo

## Componentes Principales

### XadesBesService

Servicio principal que implementa la firma XAdES-BES:

```typescript
async firmarXML(xmlContent: string, certificadoInfo: CertificadoInfo): Promise<string>
```

### Elementos Incluidos

1. **Signature** - Contenedor principal
2. **SignedInfo** - Información firmada con:
   - CanonicalizationMethod (XML C14N)
   - SignatureMethod (RSA-SHA1)
   - References (Documento + SignedProperties)
3. **SignatureValue** - Valor de la firma
4. **KeyInfo** - Certificado X.509
5. **Object/SignedProperties** - Propiedades XAdES con:
   - SigningTime (Timestamp)
   - SigningCertificate (Digest + IssuerSerial)

## Algoritmos

- **Digest**: SHA1
- **Canonicalization**: XML C14N básico (mejorable)
- **Signature**: RSA-SHA1
- **Transform**: Enveloped Signature

## Uso en el Flujo

El servicio se integra automáticamente en el flujo de facturación:

1. Se genera el XML de la factura
2. Se carga el certificado .p12
3. Se firma con XAdES-BES
4. Se envía al SRI (cola de tareas)

## Mejoras Recomendadas

### 1. Canonicalización Mejorada

Actualmente usa una implementación básica. Para producción:

```bash
npm install xml-c14n
```

O implementar el algoritmo C14N completo según W3C.

### 2. Validación de Firma

Agregar método para validar firmas:

```typescript
async validarFirma(xmlFirmado: string): Promise<boolean>
```

### 3. Soporte para SHA-256

El SRI puede requerir algoritmos más modernos:
- Digest: SHA-256
- Signature: RSA-SHA256

### 4. XAdES-T (con Timestamp Externo)

Para mayor seguridad, usar timestamp de una autoridad certificadora externa.

## Testing

Para probar la firma:

1. Subir un certificado .p12 válido
2. Generar una factura de prueba
3. Verificar que el XML firmado contenga todos los elementos
4. Validar que la firma sea correcta

## Estructura del XML Firmado

Ver `XADES-BES.md` para la estructura completa del XML firmado.


















