# Instrucciones para Eliminar Service Worker

## ⚠️ IMPORTANTE: El navegador bloquea pegar código por seguridad

Cuando intentas pegar código en la consola, el navegador muestra un mensaje de advertencia.

## Método 1: Habilitar pegado en consola

1. Abre tu aplicación: `http://localhost:5173/facturacion`
2. Presiona `F12` (abrir DevTools)
3. Ve a la pestaña **"Console"**
4. En el prompt `>`, escribe exactamente esto:
   ```
   allow pasting
   ```
5. Presiona **Enter**
6. Ahora puedes pegar el código que te di
7. Presiona **Enter** de nuevo
8. Recarga la página: `Ctrl + Shift + R`

---

## Método 2: Manual (MÁS FÁCIL - Recomendado)

Este método no requiere escribir código:

1. Abre tu aplicación: `http://localhost:5173/facturacion`
2. Presiona `F12` (abrir DevTools)
3. Ve a la pestaña **"Application"** (o "Aplicación" en español)
4. En el menú izquierdo, busca **"Service Workers"**
5. Verás una lista de Service Workers registrados
6. Para cada uno, haz click en el botón **"Unregister"**
7. Luego, en el menú izquierdo, busca **"Storage"** (o "Almacenamiento")
8. Haz click en **"Clear site data"** (o "Borrar datos del sitio")
9. Marca **TODAS** las casillas
10. Haz click en **"Clear site data"**
11. **Cierra el navegador completamente**
12. Abre el navegador en **modo incógnito**: `Ctrl + Shift + N`
13. Ve a: `http://localhost:5173/facturacion`

---

## Método 3: Desde la página del servidor

1. Asegúrate de que el servidor esté corriendo (`npm run dev`)
2. Ve a: `http://localhost:5173/eliminar-sw.html`
3. Haz click en el botón **"ELIMINAR TODO"**
4. Sigue las instrucciones que aparecen
5. Cierra el navegador y abre en modo incógnito

---

## ¿Cuál método usar?

- **Si no te gusta escribir código**: Usa el **Método 2 (Manual)**
- **Si quieres automatizarlo**: Usa el **Método 1** (con `allow pasting`)
- **Si prefieres una interfaz visual**: Usa el **Método 3**

---

## Después de eliminar el Service Worker

Los cambios que hice (símbolo $, botón en nueva posición) deberían verse correctamente.

