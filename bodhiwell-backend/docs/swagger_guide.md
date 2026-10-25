# 📖 Guía de Uso de Swagger - Bodhiwell API

Esta guía explica cómo navegar, autenticarse y probar los servicios de la API de Bodhiwell utilizando la interfaz de **Swagger UI**.

---

## 🚀 1. Acceso a la Documentación
La interfaz de Swagger está disponible en la siguiente URL de tu entorno de desarrollo:
- **URL**: `http://localhost:8000/api/doc` (o el dominio que estés usando para el backend).

---

## 🔐 2. Autenticación (Bearer Token)
La mayoría de los endpoints están protegidos y requieren un token **JWT**.

1. **Obtener el Token**:
   - Ve al módulo **Auth** en Swagger.
   - Usa el endpoint `POST /api/login_check`.
   - Haz clic en **Try it out**, introduce las credenciales y presiona **Execute**.
   - Copia el valor de la clave `token` del JSON de respuesta.

2. **Autorizar**:
   - Haz clic en el botón verde **Authorize** (arriba a la derecha).
   - En el campo **Value**, pega el token.
   - Haz clic en **Authorize** y luego en **Close**.
   - Verás que los candados de los endpoints ahora aparecen "cerrados", indicando que estás autenticado.

---

## 🧪 3. Probar Endpoints ("Try it out")
Para probar cualquier funcionalidad:
1. Despliega el endpoint deseado.
2. Haz clic en el botón superior derecho **Try it out**.
3. Rellena los parámetros requeridos (Path, Query o Request Body).
4. Haz clic en el botón azul **Execute**.
5. Revisa la **Response Body** para ver el resultado y el **Code** para el estado HTTP (200 OK, 201 Created, etc.).

---

## 🎨 4. Organización y Diseño Actualizado
Hemos mejorado el diseño para que sea más intuitivo:
- **Separación de Módulos**: Los grupos (Availabilities, Blog, Bookings, etc.) tienen mayor espacio entre ellos para evitar confusiones.
- **Títulos Claros**: Los encabezados de cada sección son más grandes y resaltan el área de trabajo.
- **Ancho Extendido**: El diseño aprovecha mejor tu pantalla para mostrar más información sin necesidad de scroll horizontal.

---

## 💡 5. Consideraciones Importantes

### 👤 Actualización de Perfil
- Los endpoints de actualización (`/api/profile` y `/api/profile/patient`) se han simplificado para usar únicamente el método **POST**.
- Esto garantiza que tanto los envíos de texto (JSON) como la subida de fotos de perfil (Multipart) funcionen correctamente bajo un mismo estándar.

### 🆔 Uso de UIDs
- La plataforma utiliza **UIDs** (UUID v4) en lugar de IDs numéricos para mayor seguridad y consistencia.
- Asegúrate de copiar el `uid` de los recursos (como reservas o reembolsos) desde los listados para usarlos en los endpoints de detalle.

### 📁 Subida de Archivos
- En endpoints que aceptan archivos (como la foto de perfil), Swagger mostrará un botón para **seleccionar archivo** cuando uses el método `POST` con tipo `multipart/form-data`.

---

> [!TIP]
> Si realizas cambios en el código y no los ves reflejados en Swagger, recuerda que puedes limpiar la caché del navegador o usar el comando `php bin/console cache:clear` en la terminal del backend.
