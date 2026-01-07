# Consumo de Web Services del SRI

## Descripción

Servicio para consumir los Web Services del SRI de Ecuador para facturación electrónica.

## Web Services Implementados

### 1. WS de Recepción
- **URL Pruebas**: `https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl`
- **URL Producción**: `https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl`
- **Método**: `validarComprobante`
- **Parámetro**: XML en Base64

### 2. WS de Autorización
- **URL Pruebas**: `https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl`
- **URL Producción**: `https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl`
- **Método**: `autorizacionComprobante`
- **Parámetro**: Clave de acceso (49 dígitos)

## Flujo de Trabajo

1. **Recepción**: Enviar XML firmado al WS de Recepción
   - El XML debe estar firmado con XAdES-BES
   - Se envía como Base64
   - Respuesta: Estado (RECIBIDA, DEVUELTA, RECIBIDA CON ERRORES)

2. **Espera**: Si el estado es "RECIBIDA", esperar 2-3 segundos
   - El SRI necesita tiempo para procesar el comprobante
   - Se implementa una espera de 3 segundos

3. **Autorización**: Consultar el WS de Autorización
   - Usar la clave de acceso de 49 dígitos
   - Respuesta: Estado (AUTORIZADO, NO AUTORIZADO), número de autorización, fecha

## Uso

```typescript
// Envío y autorización completa
const resultado = await sriWsService.enviarYAutorizar(
  xmlFirmado,
  claveAcceso,
  ambiente
);

// O por pasos
const recepcion = await sriWsService.enviarRecepcion(xmlFirmado, ambiente);
if (recepcion.estado === 'RECIBIDA') {
  await new Promise(resolve => setTimeout(resolve, 3000));
  const autorizacion = await sriWsService.consultarAutorizacion(claveAcceso, ambiente);
}
```

## Respuestas

### Recepción
```typescript
{
  estado: 'RECIBIDA' | 'DEVUELTA' | 'RECIBIDA CON ERRORES',
  comprobantes: [{
    claveAcceso: string,
    mensajes: [{
      identificador: string,
      mensaje: string,
      informacionAdicional?: string,
      tipo: string
    }]
  }]
}
```

### Autorización
```typescript
{
  autorizaciones: [{
    estado: 'AUTORIZADO' | 'NO AUTORIZADO',
    numeroAutorizacion?: string,
    fechaAutorizacion?: string,
    ambiente?: string,
    comprobante?: string, // XML autorizado
    mensajes?: [...]
  }]
}
```

## Configuración SSL

**IMPORTANTE**: Actualmente se tiene `rejectUnauthorized: false` para desarrollo/pruebas.

Para producción:
1. Configurar certificados SSL válidos
2. Cambiar `rejectUnauthorized: true`
3. O usar certificados de cliente si el SRI lo requiere

## Notas

- El XML debe estar correctamente firmado con XAdES-BES
- La clave de acceso debe ser de 49 dígitos válidos
- El ambiente debe coincidir entre recepción y autorización
- Los mensajes de error del SRI se incluyen en la respuesta


















