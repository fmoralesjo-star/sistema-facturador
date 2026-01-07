# Firma Electrónica y Generación de XML - SRI

## Módulos Implementados

### 1. FirmaElectronicaService
Gestiona certificados .p12 con seguridad:

- **Carga de certificados .p12**: Extrae certificado y clave privada
- **Vault de seguridad**: Encriptación AES-256 para contraseñas
- **Validación de vigencia**: Verifica fechas de emisión y vencimiento
- **Firma XML**: Preparado para implementar XMLDSig (pendiente implementación completa)

**Archivo**: `src/modules/sri/services/firma-electronica.service.ts`

### 2. XmlGeneratorService
Genera XML según esquema XSD del SRI v2.1.0:

- **Generación de clave de acceso**: 49 dígitos con módulo 11
- **Construcción de XML**: Según especificación del SRI
- **Validación básica**: Verifica formato XML válido

**Archivo**: `src/modules/sri/services/xml-generator.service.ts`

## Configuración

### Variables de Entorno

```env
# Ruta al certificado .p12
SRI_CERTIFICADO_PATH=./certs/certificado.p12

# Clave para encriptar contraseñas (generar una clave segura de 32 bytes)
VAULT_KEY=<clave-hex-de-64-caracteres>

# Información del emisor
SRI_RUC_EMISOR=1234567890001
SRI_RAZON_SOCIAL=Mi Empresa S.A.
SRI_DIRECCION_MATRIZ=Av. Principal 123, Quito
```

### Generar Clave del Vault

```bash
# Generar clave aleatoria de 32 bytes (64 caracteres hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Uso

### 1. Subir Certificado .p12

```http
POST /sri/certificado/upload
Content-Type: multipart/form-data

file: [archivo.p12]
ruc: 1234567890001
password: contraseña_del_certificado
```

El sistema:
- Valida el certificado
- Encripta y guarda la contraseña
- Guarda el certificado con el nombre `certificado-{RUC}.p12`

### 2. Generar XML de Factura

El XML se genera automáticamente al crear una factura:

```typescript
const xml = await xmlGeneratorService.generarXMLFactura(factura);
const claveAcceso = xmlGeneratorService.generarClaveAcceso(factura);
```

### 3. Firmar XML

```typescript
const xmlFirmado = await firmaElectronicaService.firmarXML(
  xmlContent,
  certificadoInfo
);
```

## Clave de Acceso (49 dígitos)

Formato: `DDMMAAAA + TipoComprobante(2) + RUC(13) + Ambiente(1) + Serie(17) + NumeroSecuencial(8) + CodigoNumerico(8) + TipoEmision(1) + DigitoVerificador(1)`

- **Fecha**: DDMMAAAA (8 dígitos)
- **Tipo Comprobante**: 01=Factura (2 dígitos)
- **RUC**: 13 dígitos
- **Ambiente**: 1=Producción, 2=Pruebas (1 dígito)
- **Serie**: Establecimiento(3) + PuntoEmision(3) + Secuencial(9) + Relleno(2) = 17 dígitos
- **Número Secuencial**: 8 dígitos
- **Código Numérico**: Aleatorio de 8 dígitos
- **Tipo Emisión**: 1=Normal (1 dígito)
- **Dígito Verificador**: Módulo 11 (1 dígito)

### Cálculo del Dígito Verificador (Módulo 11)

1. Multiplicar cada dígito de derecha a izquierda por factores: 2, 3, 4, 5, 6, 7 (repetir)
2. Sumar todos los productos
3. Calcular: `11 - (suma % 11)`
4. Si el resultado es 11, usar 0. Si es 10, usar 1.

## Seguridad

### Vault de Contraseñas

- Las contraseñas se encriptan con AES-256-CBC
- Se almacenan en `./certs/vault.json` con permisos 600 (solo propietario)
- En producción, usar un sistema de gestión de secretos (AWS Secrets Manager, HashiCorp Vault, etc.)

### Certificados

- Los certificados se guardan en `./certs/` con nombre `certificado-{RUC}.p12`
- Asegurar que el directorio tenga permisos restrictivos
- Nunca commitear certificados o vault en el repositorio

## Pendientes de Implementación

1. **Firma XML completa**: Implementar XMLDSig según especificación del SRI
2. **Validación XSD**: Validar XML contra esquema XSD oficial del SRI
3. **Integración con SRI**: Envío real al web service del SRI
4. **Manejo de errores**: Gestión robusta de errores del SRI

## Referencias

- [Especificación SRI v2.1.0](https://www.sri.gob.ec/)
- [XMLDSig Specification](https://www.w3.org/TR/xmldsig-core/)
- [Esquema XSD SRI](https://www.sri.gob.ec/o/sri-portlet-biblioteca-alfresco-internet/descargar/435ca226-b49d-4083-b6c0-b4b8d5a8e1fe/Factura%20Electr%C3%B3nica%202.1.0.xsd)


















