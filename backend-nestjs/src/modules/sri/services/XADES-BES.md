# Implementación XAdES-BES

## Descripción

Servicio para firmar documentos XML según el estándar **XAdES-BES** (XML Advanced Electronic Signatures - Basic Electronic Signature), requerido por el SRI de Ecuador.

## Componentes Implementados

### 1. Elemento Signature
- Contenedor principal de la firma
- Namespace: `http://www.w3.org/2000/09/xmldsig#`

### 2. SignedInfo
- Contiene la información que se firma
- Incluye:
  - **CanonicalizationMethod**: Canonicalización XML C14N
  - **SignatureMethod**: RSA-SHA1
  - **Reference**: Referencias al documento y SignedProperties

### 3. KeyInfo
- Información de la clave pública
- Incluye:
  - **X509Data**: Datos del certificado X.509
  - **X509Certificate**: Certificado en formato Base64

### 4. SignedProperties (XAdES-BES)
- Propiedades firmadas adicionales
- Incluye:
  - **SigningTime**: Timestamp de la firma
  - **SigningCertificate**: Información del certificado usado
    - **CertDigest**: Digest del certificado
    - **IssuerSerial**: Emisor y número de serie

### 5. SignatureValue
- Valor de la firma digital (Base64)
- Resultado de firmar el SignedInfo con la clave privada

## Algoritmos Utilizados

- **Digest**: SHA1
- **Canonicalization**: XML C14N (http://www.w3.org/TR/2001/REC-xml-c14n-20010315)
- **Signature**: RSA-SHA1
- **Transform**: Enveloped Signature

## Estructura del XML Firmado

```xml
<factura xmlns:ds="http://www.w3.org/2000/09/xmldsig#" 
         xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
  <!-- Contenido del XML original -->
  
  <ds:Signature Id="Signature...">
    <ds:SignedInfo>
      <ds:CanonicalizationMethod Algorithm="...xml-c14n..."/>
      <ds:SignatureMethod Algorithm="...rsa-sha1"/>
      <ds:Reference URI="#comprobante">
        <ds:Transforms>
          <ds:Transform Algorithm="...enveloped-signature"/>
        </ds:Transforms>
        <ds:DigestMethod Algorithm="...sha1"/>
        <ds:DigestValue>...</ds:DigestValue>
      </ds:Reference>
      <ds:Reference URI="#SignedProperties">
        <!-- Similar estructura -->
      </ds:Reference>
    </ds:SignedInfo>
    <ds:SignatureValue>...</ds:SignatureValue>
    <ds:KeyInfo>
      <ds:X509Data>
        <ds:X509Certificate>...</ds:X509Certificate>
      </ds:X509Data>
    </ds:KeyInfo>
    <ds:Object>
      <xades:QualifyingProperties Target="#comprobante">
        <xades:SignedProperties Id="SignedProperties">
          <xades:SignedSignatureProperties>
            <xades:SigningTime>...</xades:SigningTime>
            <xades:SigningCertificate>
              <xades:Cert>
                <xades:CertDigest>
                  <ds:DigestMethod Algorithm="...sha1"/>
                  <ds:DigestValue>...</ds:DigestValue>
                </xades:CertDigest>
                <xades:IssuerSerial>
                  <ds:X509IssuerName>...</ds:X509IssuerName>
                  <ds:X509SerialNumber>...</ds:X509SerialNumber>
                </xades:IssuerSerial>
              </xades:Cert>
            </xades:SigningCertificate>
          </xades:SignedSignatureProperties>
        </xades:SignedProperties>
      </xades:QualifyingProperties>
    </ds:Object>
  </ds:Signature>
</factura>
```

## Uso

```typescript
const xmlFirmado = await xadesBesService.firmarXML(
  xmlContent,
  certificadoInfo
);
```

## Notas Importantes

1. **Canonicalización**: La canonicalización XML es crítica para que la firma sea válida. Debe ser consistente entre el cálculo del digest y la firma.

2. **Orden de Elementos**: El orden de los elementos en SignedInfo es importante y debe seguir el estándar.

3. **Digest del Documento**: Se calcula sobre el XML canonicalizado, excluyendo el elemento Signature.

4. **Digest del Certificado**: Se calcula sobre el certificado en formato DER (binario).

5. **Firma del SignedInfo**: Se firma el SignedInfo canonicalizado con la clave privada usando RSA-SHA1.

## Validación

Para validar la firma, se debe:
1. Verificar que el certificado sea válido y esté vigente
2. Verificar que el digest del documento coincida
3. Verificar que la firma del SignedInfo sea válida usando la clave pública del certificado
4. Verificar el timestamp (SigningTime)
5. Verificar el digest del certificado en SignedProperties

## Mejoras Futuras

- Usar librería especializada para canonicalización XML (xml-c14n)
- Implementar XAdES-T (con timestamp externo)
- Implementar XAdES-X (con referencias a datos externos)
- Soporte para algoritmos más modernos (SHA-256, RSA-SHA256)


















