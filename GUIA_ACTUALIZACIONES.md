# 🚀 Guía de Actualización del Sistema Facturador

Tu sistema está configurado con **CI/CD** (Despliegue Continuo) en Render.com.
Esto significa que cualquier cambio aprobado en tu código se refleja automáticamente en la nube.

## 🔄 El Ciclo de Actualización

### 1. Desarrollo Local
Haz tus cambios en el código (Backend o Frontend) en tu computadora.
- Asegúrate de guardar los archivos.
- Prueba que todo funcione localmente (`npm run dev` en client, `npm run start:dev` en backend).

### 2. Confirmar Cambios (Git Commit)
Una vez satisfecho con los cambios, abre una terminal en la raíz del proyecto y ejecuta:

```bash
# 1. Agrega los archivos modificados
git add .

# 2. Crea un paquete con esos cambios (Pon un mensaje descriptivo)
git commit -m "feat: Agregué tal funcionalidad" o "fix: Corregí error en login"
```

### 3. Enviar a la Nube (Git Push)
Este es el "botón de actualizar". Al ejecutar este comando, envías tu código a GitHub.

```bash
git push origin main
```

### 4. Despliegue Automático (Render)
Aquí ocurre la magía.
1. Render detecta el nuevo cambio en GitHub inmediatamente.
2. Inicia un nuevo "Build" (Construcción).
   - **Backend:** Tarda aprox 1-2 minutos.
   - **Frontend:** Tarda aprox 2-3 minutos.
3. Si el build es exitoso, Render reemplaza la versión vieja por la nueva.

---

## ⚠️ Casos Especiales

### ¿Cuándo debo ir a Render manualmente?

Solo en dos casos:

1.  **Cambio de Variables de Entorno (.env):**
    Si agregas una nueva clave secreta o cambias una configuración (como la contraseña de la base de datos), el `git push` NO la actualizará por seguridad.
    - Debes ir a: Render Dashboard -> Tu Servicio -> Environment -> Add Environment Variable.

2.  **Si el despliegue falla:**
    Si hiciste un `push` pero la web no se actualiza o sale error, entra al Dashboard de Render y mira los "Logs" para ver qué pasó (ej. un error de sintaxis que pasó desapercibido).

---

## 💡 Resumen para el día a día

Simplemente ejecuta esto en tu terminal para actualizar:

```bash
git add .
git commit -m "Descripción de tu cambio"
git push origin main
```

¡Y listo! Ve por un café ☕ mientras se actualiza solo.
