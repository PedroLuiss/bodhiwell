
# 📚 API de Perfil de Usuario
---

## Autenticación

### Registro de usuario

**POST** `/api/auth/register`

- **Descripción:** Registra un nuevo usuario en la plataforma (paciente o profesional).
- **Body (JSON):**
  ```json
  {
      "first_name": "Nombre",
      "last_name": "Apellido",
      "email": "correo@ejemplo.com",
      "password": "Password123!",
      "type_account": "professional",
      "main_profession_uid": "uid-profesion",
      "newsletter_active": true
  }
  ```
- **Campos:**
  - `first_name`: (string, opcional) Nombre del usuario.
  - `last_name`: (string, opcional) Apellido del usuario.
  - `email`: (string, requerido) Correo electrónico único.
  - `password`: (string, requerido) Contraseña segura.
  - `type_account`: (string, requerido) Tipo de cuenta: `patient` o `professional`.
  - `main_profession_uid`: (string, requerido si es profesional) UID de la profesión principal.
  - `newsletter_active`: (bool, opcional, default false) Indica si el usuario acepta recibir correos masivos/boletines.
- **Respuesta 200 (o 201):**
  ```json
  {
      "user": {
          "email": "correo@ejemplo.com",
          "username": "nombre_apellido",
          ...
      }
  }
  ```

---
---

## Recuperación de Contraseña

### 1. Solicitar enlace de recuperación

**POST** `/api/auth/forgot-password`

- **Descripción:** Solicita un enlace para restablecer la contraseña. Si el correo existe en el sistema, se enviará un email con un enlace de recuperación.
- **Autenticación:** No requerida (`PUBLIC_ACCESS`).
- **Body (JSON):**
  ```json
  {
      "email": "correo@ejemplo.com"
  }
  ```
- **Respuesta 200:** (**Siempre devuelve 200** por seguridad para evitar enumeración de usuarios).
  ```json
  {
      "message": "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación."
  }
  ```
- **Errores comunes:**
  - `400` – Faltan parametros (email).

---

### 2. Validar Token

**GET** `/api/auth/validate-token/{{token}}`

- **Descripción:** Verifica si un token de recuperación es válido y no ha expirado. Utilizado por el frontend al cargar la pantalla de "Nueva Contraseña".
- **Parámetros:**
    - `token`: (string, en la URL) El token recibido por correo.
- **Autenticación:** No requerida (`PUBLIC_ACCESS`).
- **Respuesta 200:** (Token válido)
  ```json
  {
      "valid": true
  }
  ```
- **Errores comunes:**
  - `404` – Token inválido o no encontrado. (`{"message": "Token inválido."}`)
  - `400` – Token expirado. (`{"message": "El token ha expirado."}`)

---

### 3. Restablecer Contraseña

**POST** `/api/auth/reset-password`

- **Descripción:** Establece una nueva contraseña utilizando un token válido.
- **Autenticación:** No requerida (`PUBLIC_ACCESS`).
- **Body (JSON):**
  ```json
  {
      "token": "token_recibido_por_email",
      "newPassword": "NuevaPasswordSegura123!"
  }
  ```
- **Respuesta 200:**
  ```json
  {
      "message": "Contraseña restablecida correctamente."
  }
  ```
- **Errores comunes:**
  - `400` – Faltan parámetros o token expirado.
  - `404` – Token inválido.

---

## Notificaciones (Push)

### Listar notificaciones

**GET** `/api/notifications`

- **Descripción:** Devuelve el listado paginado de notificaciones del usuario autenticado. Solo retorna notificaciones propias.
- **Autenticación:** Requiere header `Authorization: Bearer <token>` y rol `ROLE_USER`.
- **Paginación (query params):**
  - `page` (int, opcional, por defecto 1, mínimo 1)
  - `limit` (int, opcional, por defecto 20, rango 1..100)
  - Cálculo interno de `offset = (page - 1) * limit`.
- **Filtros (query params opcionales):**
  - `search`: (string) Busca por coincidencia en el título de la notificación.
  - `type`: (string) Filtra por tipo de notificación (`BOOKING`, `PAYMENT`, `SYSTEM`, `REMINDER`).
  - `prioritize_unread`: (bool) Si es `true`, muestra primero las no leídas.

- **Respuesta 200:**
  ```json
  {
    "data": [
      {
        "uid": "noti-uuid-1",
        "title": "Título de la notificación",
        "body": "Texto del mensaje",
        "type": "BOOKING",
        "data": { "booking_uid": "..." },
        "readAt": null,
        "createdAt": "2025-12-16T10:00:00+00:00"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "pages": 1
    }
  }
  ```

- **Notas:**
  - El campo `uid` es el identificador único de la notificación (usar para acciones como marcar como leída).
  - El campo `data` puede incluir información contextual (ej: `booking_uid`).
  - El campo `readAt` es `null` si la notificación no ha sido leída.
  - El campo `type` corresponde a los valores del enum: `BOOKING`, `PAYMENT`, `SYSTEM`, `REMINDER`.

---

### Marcar notificación como leída

**PATCH** `/api/notifications/{uid}/read`

- **Descripción:** Marca una notificación como leída usando su `uid`.
- **Autenticación:** Requiere header `Authorization: Bearer <token>`.
- **Respuesta 200:**
  ```json
  { "message": "Notification marked as read" }
  ```
- **Errores comunes:**
  - `404` – Notificación no encontrada.
  - `403` – Acceso denegado (no es tu notificación).

---


### Marcar todas las notificaciones como leídas

**PATCH** `/api/notifications/read-all`

- **Descripción:** Marca todas las notificaciones del usuario autenticado como leídas.
- **Autenticación:** Requiere header `Authorization: Bearer <token>`.
- **Respuesta 200:**
  ```json
  {
    "message": "All notifications marked as read",
    "updated_count": 12
  }
  ```
- **Errores comunes:**
  - `401` – Usuario no autenticado.

---

### Contar notificaciones no leídas

**GET** `/api/notifications/unread-count`

- **Descripción:** Devuelve la cantidad de notificaciones no leídas del usuario autenticado.
- **Respuesta 200:**
  ```json
  { "count": 2 }
  ```

---

### Registrar/actualizar token de dispositivo

**POST** `/api/notifications/device-token`

- **Descripción:** Registra o actualiza el token FCM del dispositivo para recibir notificaciones push.
- **Body (JSON):**
  ```json
  { "token": "fcm-token-del-dispositivo" }
  ```
- **Respuesta 200:**
  ```json
  { "message": "Device token updated successfully" }
  ```

---

Esta sección describe los endpoints relacionados con el perfil de usuario, los campos soportados y sus formatos.

---

## Reservas y Consultas

### Listado y detalle de reservas (Bookings)

El backend retorna la misma estructura de datos tanto para el listado (`GET /api/bookings`) como para el detalle (`GET /api/bookings/{uid}`). Cada item incluye todos los campos necesarios para que el frontend decida qué acciones mostrar.

Campos devueltos por reserva:
- `uid`: UID de la reserva.
- `professional_uid`: UID del profesional.
- `patient_uid`: UID del paciente.
- `professional`: Nombre y apellido del profesional (sanitizado).
- `patient`: Nombre y apellido del paciente (sanitizado).
- `date_start`: Inicio de la reserva (`YYYY-MM-DD HH:MM`).
- `date_end`: Fin calculado según la duración configurada en el perfil del profesional.
- `status`: Estado de la reserva (enum BookingEnum: `waiting_payment`, `processing`, `pending_provider`, `confirmed`, `cancelled`, `completed`, `pending` [legacy]).
- `notes`: Notas libres asociadas a la reserva (multilínea sanitizada).
- `type`: Tipo de consulta (`virtual` | `presential`).
- `reserve_reason`: Motivo ingresado al crear la reserva (multilínea sanitizada).
- `quote_for_invited`: Booleano, indica si es una cita cotizada para un invitado.
- `patient_image`: URL/ruta a imagen cargada por el paciente (puede ser `null`).
- `main_profession`: Nombre de la profesión principal del profesional (puede ser `null`).
- `banner_image`: URL/ruta de banner del profesional (puede ser `null`).
- `prefix_professional`: Prefijo del profesional (Dr., Lic., etc.) (puede ser `null`).
- `isConsulted`: Booleano; `true` si ya existe una consulta (informe) relacionada.
- `consultationStatus`: Estado de la consulta asociada o `null` si no existe. Si existe pero su valor interno está vacío se devuelve `pending` por fallback.
- `consultation`: Objeto con datos de la consulta o `null` si no existe.
  - `consultation.uid`: UID de la consulta.
  - `consultation.status`: Estado normalizado (con fallback a `pending`).
  - `consultation.notes`: Notas del profesional dentro de la consulta.
  - `consultation.observations`: Observaciones / razón de la consulta (normalizadas).
- `details`: Array de objetos `{ key, value }` según `BookingDetailTypeEnum` (ej: `MEETING_LINK`, `ADDRESS`).
- `canCreateConsultation`: Booleano; calculado como `!isConsulted && now >= date_start`.

Ejemplo (reserva virtual ya consultada):
```json
{
  "uid": "3f1d5d7a-3a7f-4a3d-9a12-1c0e5a2a4c7b",
  "professional_uid": "8c7c8d3a-8f1e-42a9-bc8d-2a7e9d1a3c4b",
  "patient_uid": "9aa81234-7b2c-4e55-a901-55aa22bb33cc",
  "professional": "Dra. Ana Pérez",
  "patient": "Juan Gómez",
  "date_start": "2025-10-29 10:00",
  "date_end": "2025-10-29 11:00",
  "status": "completed",
  "notes": "Paciente con dolor de cabeza",
  "type": "virtual",
  "reserve_reason": "Dolor persistente",
  "quote_for_invited": false,
  "patient_image": "/uploads/booking_attachments/abc.webp",
  "main_profession": "Psicología",
  "banner_image": "/uploads/banners/x.webp",
  "prefix_professional": "Dra.",
  "isConsulted": true,
  "consultationStatus": "completed",
  "consultation": {
    "uid": "b1c2d3e4-f567-8901-a2b3-c4d5e6f7a8b9",
    "status": "completed",
    "notes": "Evolución favorable, continuar hidratación.
Se recomienda control en 7 días.",
    "observations": "Motivo inicial: dolor persistente en la zona temporal"
  },
  "details": [
    { "key": "MEETING_LINK", "value": "https://meeting/3f1d5d7a3a7f4a3d" }
  ],
  "canCreateConsultation": false
}
```

Ejemplo (reserva presencial sin consulta todavía):
```json
{
  "uid": "111d5d7a-3a7f-4a3d-9a12-1c0e5a2a4c7b",
  "professional_uid": "222c8d3a-8f1e-42a9-bc8d-2a7e9d1a3c4b",
  "patient_uid": "33381234-7b2c-4e55-a901-55aa22bb33cc",
  "professional": "Lic. Carlos Ruiz",
  "patient": "María Pérez",
  "date_start": "2025-11-02 15:30",
  "date_end": "2025-11-02 16:30",
  "status": "confirmed",
  "notes": null,
  "type": "presential",
  "reserve_reason": "Evaluación inicial",
  "quote_for_invited": false,
  "patient_image": null,
  "main_profession": "Psiquiatría",
  "banner_image": null,
  "prefix_professional": "Lic.",
  "isConsulted": false,
  "consultationStatus": null,
  "consultation": null,
  "details": [
    { "key": "ADDRESS", "value": "Av. Principal 123, Oficina 4" }
  ],
  "canCreateConsultation": true
}
```

Notas adicionales:
- `consultation` es `null` cuando `isConsulted = false`.
- El frontend puede usar `canCreateConsultation` para habilitar la acción de “Crear informe” (solo rol profesional).
- `consultationStatus` se incluye también cuando hay consulta para mostrar su evolución sin tener que abrir el detalle completo.
- La estructura del detalle (`GET /api/bookings/{uid}`) es idéntica a la de un item de listado.

---

## Detalle de la consulta

### GET `/api/consultations/{consultationUid}`

- Acceso:
  - Paciente: solo si la consulta pertenece a una reserva suya.
  - Profesional: puede ver la consulta de un paciente si tiene cualquier reserva con ese paciente (aunque sea con otro profesional).
- Campos devueltos:
  - `uid`: UID de la consulta.
  - `date_booking_start`: Fecha/hora de inicio de la reserva asociada (`YYYY/MM/DD HH:MM`).
  - `reserve_reason`: Motivo de la reserva (si existe, puede ser `null`).
  - `observations`: Observaciones normalizadas de la consulta.
  - `notes`: Notas del profesional en la consulta.
  - `professionalUid`: UID del profesional que realizó la consulta.
  - `professionalName`: Nombre completo del profesional.
  - `prefix_professional`: Prefijo profesional (Dr., Lic., etc.).

- Respuesta (ejemplo):
  ```json
  {
    "uid": "a1b2c3d4-e5f6-7890-abcd-ef0123456789",
    "date_booking_start": "2025/10/29 10:00",
    "reserve_reason": "Dolor persistente",
    "observations": "Observaciones de la consulta",
    "notes": "Notas del profesional",
    "professionalUid": "8c7c8d3a-8f1e-42a9-bc8d-2a7e9d1a3c4b",
    "professionalName": "Dra. Ana Pérez",
    "professionalEmail": "ana.perez@example.com",
    "prefix_professional": "Dra."
  }
  ```

Notas:
- `date_booking_start` se entrega en formato `AAAA/MM/DD HH:MM` (`Y/m/d H:i`).
- `observations` y `notes` provienen de los `ConsultationDetails` normalizados.

---

## Crear informe (Generar consulta)

### POST `/api/consultations`

- El campo `type` se toma del booking asociado; no se envía en el body.
- Cuerpo de solicitud:
  ```json
  {
    "bookingUid": "63ed6836-99df-4c3c-ae78-21ba02a7b6a6",
    "details": {
      "notes": "voy en camino2",
      "reasonConsultation": "Locura en exceso",
      "observations": "El paciente esta loco e bola"
    }
  }
  ```
- Reglas y comportamiento:
  - Requiere que la reserva exista, no esté cancelada y no tenga consulta previa.
  - `details.notes`, `details.reasonConsultation` y `details.observations` son obligatorios.
  - Para reservas virtuales, el `meetingLink` se inyecta automáticamente desde los `BookingDetails` (o generado por el backend si aplica).
  - Para presenciales, el `address` se toma del perfil del profesional y se incluye en los `BookingDetails`.
  - La respuesta incluye el `uid` de la consulta y la fecha de inicio de la reserva.
  - No se puede generar la consulta antes de la fecha/hora de inicio de la reserva (`now < date_start`). Si se intenta, responde 400.
- Respuesta 201 (ejemplo):
  ```json
  {
    "uid": "c8d3f9a1-1b2c-4d5e-8f90-1234567890ab",
    "bookingUid": "63ed6836-99df-4c3c-ae78-21ba02a7b6a6",
    "type": "virtual",
    "date_booking_start": "2025/10/29 10:00",
    "details": {
      "notes": "voy en camino2",
      "reasonConsultation": "Locura en exceso",
      "observations": "El paciente esta loco e bola"
    },
    "createdAt": "2025-10-29T10:05:23+00:00"
  }
  ```
- Errores comunes:
  - `400` – Cuerpo inválido o validaciones de negocio (faltan campos requeridos, reserva cancelada, etc.).
  - `400` – Intento de crear la consulta antes de la fecha de inicio de la reserva.
  - `401` – No autenticado.
  - `403` – No autorizado (la reserva no pertenece al usuario actual).
  - `404` – Reserva no encontrada.
  - `409` – Ya existe una consulta para esta reserva.

Ejemplo error creación antes de la hora:
```json
{ "code": 400, "message": "Aún no puedes generar el informe: la reserva inicia el 2025-11-02 15:30." }
```

---

## Endpoints de Profile

### 1. Obtener perfil propio

**GET** `/api/me`

- **Descripción:** Devuelve el perfil completo del usuario autenticado.
- **Respuesta:**
    ```json
    {
      "email": "user@email.com",
      "username": "usuario",
      "first_name": "Nombre",
      "last_name": "Apellido",
      "type_account": "patient",
      "details": {
        "account_number": "1234567890",
        "image": "https://url-to-image.jpg",
        "banner_image": "https://url-to-banner.jpg",
        "date_birth": "1990-05-21T00:00:00+00:00",
        "gender": "female",
        "country": {
            "code": "AR",
            "name": "Argentina"
        },
        ...
      },
      "studies": [ 
        {
          "uid": "study-uid",
          "name": "Nombre del estudio",
          "institute": "Instituto",
          "url_certificate": "https://url-al-certificado.pdf",
          ...
        }
      ],
      "professions": [ ... ],
      "specialties": [
        {
          "uid": "specialty-uid-1",
          "name": "Specialty Name",
          "slug": "specialty-slug",
          "dimension": {
            "uid": "dim-uid",
            "name": "Dimension Name",
            "slug": "dimension-slug"
          }
        }
      ]
    }
    ```

---

### 2. Actualizar perfil

**POST/PUT/PATCH** `/api/profile`

- **Descripción:** Permite actualizar los datos del perfil del usuario autenticado.
- **Body (form-data o JSON):**  
  Debes enviar los campos que deseas actualizar.  

  Ejemplo:
    ```json
    {
      "first_name": "NuevoNombre",
      "last_name": "NuevoApellido",
      "type_account": "professional",
      "dni": "12345678",
      "specialties": ["uid-specialty-1", "uid-specialty-2"],
      "details": {
        "about": "<p>Texto enriquecido</p>",
        "image": "/uploads/profiles/avatar1.jpg",
        "banner_image": "/uploads/banners/banner1.webp",
        "short_description": "Terapeuta con 10 años de experiencia.",
        "professional_info": "<ul><li>Certificado A</li></ul>",
        "consult_type": "presential",
        "consult_price": 50.00,
        "zipcode": "1234",
        "date_birth": "1990-01-15",
        "prefix_professional": "Dr",
        "account_number": "1234567890"
      },
      "studies": [
        {
           "uid": "study-uid-existente",
           "name": "Ingeniería",
           "institute": "Universidad",
           "url_certificate": "https://..."
        }
      ]
    }
    ```
    *Nota: `consult_type` acepta: `presential`, `virtual`, `hybrid`.*
    *Nota: `specialties` acepta un array de UIDs (strings) de las especialidades.*
    *Nota: Para subir/actualizar el certificado de un estudio, enviar el archivo en el campo `studies[index][url_certificate]` (multipart/form-data). Si se actualiza un estudio y no se envía este campo, se conserva el certificado existente.*

- **Respuesta exitosa:**
    ```json
    {
      "code": 200,
      "message": "Profile updated"
    }
    ```
- **Respuesta de error:**
    ```json
    {
      "code": 422,
      "message": "Debe aceptar las políticas."
    }
    ```

---

### 2.b Actualizar perfil de paciente

**POST/PUT/PATCH** `/api/profile/patient`

- Descripción: Actualiza datos básicos del perfil de un usuario paciente y, opcionalmente, su foto de perfil.
- Autenticación: Requiere header `Authorization: Bearer <token>` y rol `ROLE_USER`.
- Content-Type soportados:
  - `application/json` (solo campos, sin archivo)
  - `multipart/form-data` (campos + archivo `profile_image`)

Encabezados necesarios
- `Authorization: Bearer <token>`
- `Accept: application/json`

Esquema de campos (body)
- `first_name` string, máx 80, requerido
- `last_name` string, máx 80, requerido
- `date_birth` string con formato `YYYY-MM-DD` (ej: `1990-05-21`)
- `phone` string, máx 25
- `gender` string, uno de: `male`, `female`, `other`
- `zipcode` string, máx 20
- `address` string, máx 255
- `city` string, máx 120
- `country` string, máx 120
- `medical_condition` string (texto enriquecido; se permite HTML/Markdown, se sanitiza en el backend)

Archivo opcional (solo multipart/form-data)
- `profile_image`: imagen a subir
  - Tamaño máx: 1 MB
  - Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`
  - Guardado final: `/uploads/profiles/<nombre>`

Validaciones y reglas
- `first_name` y `last_name` no pueden ser vacíos.
- `date_birth` debe tener el formato `YYYY-MM-DD`; si no, el backend responde 422.
- `medical_condition` permite HTML/Markdown y se sanitiza antes de persistir.
- El archivo `profile_image` debe cumplir con tamaño y MIME permitidos (ver `config/services.yaml -> parameters.app.uploads.profile_images`).

Ejemplos de prueba

1) JSON (sin archivo)
```bash
curl -X POST "{{base_url}}/api/profile/patient" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "María",
    "last_name": "Pérez",
    "dni": "12345678",
    "userDetails": {
      "zipcode": "1234",
      "date_birth": "1990-01-15",
      "gender": "female",
      "account_number": "1234567890"
    },
    "date_birth": "1992-03-15",
    "phone": "+34 600 111 222",
    "address": "Calle Mayor 123",
    "city": "Madrid",
    "country": "ES",
    "medical_condition": "<p>Hipertensión controlada.</p>"
  }'
```

2) multipart/form-data (con archivo)
```bash
curl -X POST "{{base_url}}/api/profile/patient" \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json" \
  -F "first_name=María" \
  -F "last_name=Pérez" \
  -F "date_birth=1992-03-15" \
  -F "gender=female" \
  -F "profile_image=@/ruta/a/foto.jpg"
```

3) Error de validación (fecha inválida)
```bash
curl -X POST "{{base_url}}/api/profile/patient" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "María",
    "last_name": "Pérez",
    "date_birth": "15/03/1992"
  }'
```

Respuestas
- Éxito 200
```json
{ "code": 200, "message": "Profile updated" }
```

- Error 401
```json
{ "code": 401, "message": "Token inválido o usuario no autenticado" }
```

- Error 422 (ejemplo)
```json
{ "code": 422, "message": "Validación: date_birth con formato inválido (YYYY-MM-DD)." }
```

- Error 500
```json
{ "code": 500, "message": "Error al actualizar el perfil, contacte con soporte" }
```

### 3. Obtener perfil por UID

**GET** `/profile/{uid}`

- **Descripción:** Devuelve el perfil público de un usuario por su UID.
- **Respuesta:** Igual que `/api/me`, pero solo campos públicos.

---

### 3.b Listar Profesionales (Búsqueda)

**GET** `/professionals`

- **Descripción:** Busca y lista profesionales activos.
- **Parámetros (Query):**
  - `q`: (string, opcional) Texto para buscar por nombre, apellido, profesión o nombre de especialidad.
  - `dimension`: (string UID, opcional) UID de la dimensión para filtrar.
  - `specialties[]`: (array de string UIDs, opcional) Lista de UIDs de especialidades para filtrar.
- **Ejemplo de uso:**
  ```http
  GET /professionals?q=ansiedad&dimension=uid-dimension&specialties[]=uid-specialty-1&specialties[]=uid-specialty-2
  ```
- **Respuesta 200:**
  Devuelve un array de objetos de usuario (resumido).

---

### 4. Obtener profesiones y estudios

- **GET** `/profile/{uid}/professions`
- **GET** `/profile/{uid}/studies`

Devuelven los arrays correspondientes del usuario. Los estudios incluyen el campo `url_certificate`.

---

### 5. Listar disponibilidades propias

**GET** `/api/profile/my-availabilities`

- Descripción: Entrega las disponibilidades del profesional autenticado correspondientes a los últimos N meses.
- Autenticación: Requiere `Authorization: Bearer <token>` con cuenta profesional (`type_account = professional`).
- Nota: N se configura con la variable de entorno `AVAILABILITY_HISTORY_MONTHS` (por defecto 2). Las fechas se devuelven en formato `YYYY-MM-DD` y los horarios como bloques (`slots`).
- Respuesta 200:
    ```json
    {
      "data": [
        {
          "uid": "7b9e5b65-44c1-4a8c-9f17-2bf6ef0b42a0",
          "day": 5,
          "date": "2025-10-10",
          "slots": [
            { "start": "09:00", "end": "12:00" },
            { "start": "15:00", "end": "17:00" }
          ],
          "reservations": [
            {
              "uid": "booking-1",
              "patientName": "Juan Gómez",
              "reservationTime": { "start": "14:12", "end": "16:12" }
            }
          ]
        },
        {
          "uid": "9f7218d1-58fb-4c98-9f0d-6b4f1ce6f2e2",
          "day": 1,
          "date": "2025-10-13",
          "slots": [
            { "start": "14:00", "end": "18:00" }
          ]
        }
      ]
    }
    ```

- Cada elemento de los arrays `reservations` incluye:
  - `hasReservation`: `true` si la disponibilidad tiene al menos una reserva.
  - `reservationTime`: objeto con `start` y `end` en formato `HH:MM` para la franja exacta reservada.
- Errores comunes:
    - `401` – Usuario no autenticado.
      ```json
      { "error": "Autenticación requerida." }
      ```
    - `403` – Cuenta autenticada sin rol profesional.
      ```json
      { "error": "Acceso denegado: solo profesionales" }
      ```

---

### 6. Sincronizar disponibilidades propias (crear/actualizar/eliminar)

**POST/PUT** `/api/profile/my-availabilities`

- Descripción: Crea, actualiza o elimina disponibilidades por fecha. Cada disponibilidad corresponde a una fecha (`date`) y contiene hasta 5 bloques horarios (`slots`).
- Autenticación: Requiere `Authorization: Bearer <token>` con cuenta profesional.
- Body (JSON):
    ```json
    {
      "availabilities": [
        {
          "date": "2025-10-20",
          "slots": [
            { "start": "09:00", "end": "12:00" },
            { "start": "15:00", "end": "17:00" }
          ]
        },
        {
          "uid": "7b9e5b65-44c1-4a8c-9f17-2bf6ef0b42a0",
          "date": "2025-10-22",
          "slots": [ { "start": "10:00", "end": "13:00" } ]
        },
        {
          "uid": "9f7218d1-58fb-4c98-9f0d-6b4f1ce6f2e2",
          "delete": true
        }
      ]
    }
    ```
- Reglas y validaciones:
    - Máximo 1 disponibilidad por fecha. Si ya existe para la misma `date`, se rechaza.
    - Cada disponibilidad admite hasta 5 bloques en `slots`.
    - `start` y `end` deben tener formato `HH:MM` 24h y `start < end`.
    - Los bloques de una misma disponibilidad no deben solaparse entre sí.
    - No puede solaparse con otras disponibilidades existentes del mismo día.
    - No se pueden crear/editar/eliminar disponibilidades de fechas anteriores a hoy.
    - Para hoy, la edición/eliminación requiere al menos 1 hora de anticipación respecto al primer bloque.
    - No se puede editar/eliminar una disponibilidad que ya tenga reservas asociadas.
- Respuesta 200: Devuelve la lista actualizada después de aplicar los cambios (mismo formato que el GET propio).
    ```json
    {
      "data": [
        {
          "uid": "d6d0f5c8-8f82-4f09-97d2-629dc15b59ab",
          "day": 1,
          "date": "2025-10-20",
          "slots": [
            { "start": "09:00", "end": "12:00" },
            { "start": "15:00", "end": "17:00" }
          ]
        }
      ]
    }
    ```
- Errores comunes:
    - `400` – Argumentos inválidos (p. ej., falta `date`/`slots` o formato de fecha inválido).
      ```json
      { "error": "date y slots son requeridos en fecha 2025-10-20 09:00-12:00 (#0)" }
      ```
    - `401` – Usuario no autenticado.
      ```json
      { "error": "Autenticación requerida." }
      ```
    - `403` – Cuenta autenticada sin rol profesional.
      ```json
      { "error": "Acceso denegado: solo profesionales" }
      ```
    - `422` – Reglas de dominio/validación (solapamientos, máximo de bloques, ventana temporal, reservas existentes, etc.).
      ```json
      { "error": "Los bloques no deben solaparse entre sí en fecha 2025-10-20 10:00-11:00 (#1) (bloque 2)" }
      ```
    - `422` – Errores de validación del DTO (estructura del payload):
      ```json
      { "errors": [ { "field": "availabilities[0].date", "message": "Este valor no debería estar vacío." } ] }
      ```
    - `500` – Error interno. En entorno `dev` el mensaje puede ser específico; en producción será genérico.

---

### 7. Listar disponibilidades de un profesional (público)

**GET** `/api/professionals/{uid}/availabilities`

- Descripción: Devuelve las disponibilidades públicas de un profesional identificado por su `uid`.
- Autenticación: No requerida.
- Respuesta 200:
    ```json
    [
      {
        "dayInt": 5,
        "day": "Viernes",
        "date": "2025-10-10",
        "slots": [
          { "start": "09:00", "end": "12:00" },
          { "start": "15:00", "end": "17:00" }
        ],
        "reservations": [
          {
            "uid": "booking-2",
            "patientName": "Lucía García",
            "reservationTime": { "start": "14:12", "end": "16:12" }
          }
        ]
      },
      {
        "dayInt": 1,
        "day": "Lunes",
        "date": "2025-10-13",
        "slots": [ { "start": "14:00", "end": "18:00" } ]
      }
    ]
    ```

- Cada item de `reservations` incluye: `hasReservation: true` (indica que hay al menos una reserva) y `reservationTime` con `start`/`end` (`HH:MM`) que describe la franja exacta asociada.
- Errores comunes:
    - `404` – Profesional no encontrado.
      ```json
      { "error": "Profesional no encontrado" }
      ```

---

## Taxonomías (Dimensiones y Especialidades)

### 1. Listar Dimensiones

**GET** `/api/dimensions`

- **Descripción:** Devuelve el listado completo de dimensiones disponibles en el sistema.
- **Autenticación:** No requerida (Público).
- **Respuesta 200:**
    ```json
    [
      {
        "uid": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Cuerpo",
        "slug": "cuerpo",
        "colorCode": "#00B894",
        "icon": "icon-body"
      },
      {
        "uid": "987e6543-e21b-12d3-a456-426614174001",
        "name": "Mente",
        "slug": "mente",
        "colorCode": "#6C5CE7",
        "icon": "icon-mind"
      }
    ]
    ```

### 2. Listar Especialidades

**GET** `/api/specialties`

- **Descripción:** Devuelve el listado completo de especialidades disponibles, incluyendo la información básica de su dimensión asociada.
- **Autenticación:** No requerida (Público).
- **Parámetros (Query):**
  - `dimension`: (string UID, opcional) UID de la dimensión para filtrar las especialidades.
- **Respuesta 200:**
    ```json
    [
      {
        "uid": "specialty-uuid-1",
        "name": "Yoga",
        "slug": "yoga",
        "dimension": {
          "uid": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Cuerpo",
          "slug": "cuerpo",
          "colorCode": "#00B894"
        }
      },
      {
        "uid": "specialty-uuid-2",
        "name": "Meditación",
        "slug": "meditacion",
        "dimension": {
          "uid": "987e6543-e21b-12d3-a456-426614174001",
          "name": "Mente",
          "slug": "mente",
          "colorCode": "#6C5CE7"
        }
      }
    ]
    ```

---

## Campos y formatos de UserDetails

| Campo                  | Tipo                   | Descripción                                                                                   |
|------------------------|------------------------|-----------------------------------------------------------------------------------------------|
| `image`                | string (URL)           | Ruta o URL de la imagen de perfil. Solo imágenes `.jpg`, `.jpeg`, `.png`, `.webp`.            |
| `banner_image`         | string (URL)           | Ruta o URL de la imagen de banner. Solo imágenes `.jpg`, `.jpeg`, `.png`, `.webp`.            |
| `about`                | string (HTML/Markdown) | Texto enriquecido sobre el usuario (puede contener HTML o Markdown).                          |
| `short_description`    | string                 | Descripción corta del usuario (puede ser texto enriquecido).                                  |
| `professional_info`    | string (HTML/Markdown) | Información profesional adicional (puede contener HTML o Markdown).                           |
| `date_birth`           | string (date)          | Fecha de nacimiento del usuario.                                                              |
| `gender`               | string                 | Género del usuario.                                                                           |
| `country`              | string                 | País de residencia.                                                                           |
| `city`                 | string                 | Ciudad de residencia.                                                                         |
| `zipcode`              | string                 | Código postal.                                                                                |
| `address`              | string                 | Dirección física.                                                                             |
| `language`             | string                 | Idioma principal.                                                                             |
| `phone`                | string                 | Número de teléfono.                                                                           |
| `time_availability`    | array                  | Disponibilidad de tiempo (estructura definida por la app).                                    |
| `policies`             | boolean                | Indica si el usuario aceptó las políticas.                                                    |
| `medical_condition`    | array                  | Condiciones médicas relevantes.                                                               |
| `consult_time`         | integer                | Duración de la consulta en minutos.                                                           |
| `main_profession`      | string (uid)           | UID de la profesión principal.                                                                |
| `prefix_professional`  | string                 | Prefijo profesional (ej: Dr., Lic.).                                                          |


### Notas

- **Imágenes:** Los campos `image` y `banner_image` solo almacenan la ruta o URL de la imagen. El archivo debe subirse previamente y cumplir con los formatos permitidos (`.jpg`, `.jpeg`, `.png`, `.webp`).
- **Textos enriquecidos:** Los campos `about`, `short_description` y `professional_info` permiten texto enriquecido (HTML o Markdown).
- **Límites de tamaño:** Los campos de texto enriquecido tienen un límite de 65535 caracteres.

---

### Crear Pago

**POST** `/api/bookings/{uid}/payments`

- **Descripción:** Inicia un proceso de pago para una reserva específica.
- **Autenticación:** Requiere `Authorization: Bearer <token>`.
- **Body (JSON):**
  ```json
  {
    "amount": 150.00,
    "currency": "USD",
    "paymentMethod": "credit_card"
  }
  ```
- **Campos:**
  - `amount`: Monto a pagar (decimal o entero, se convierte a centavos).
  - `currency`: Moneda del pago (opcional).
  - `paymentMethod`: Método de pago (opcional, string).
- **Respuesta 201:**
  ```json
  {
    "paymentUid": "pay-123...",
    "paymentUrl": "https://checkout.plexo.com/..."
  }
  ```

---

### Listar pagos (multirol)

**GET** `/api/payments`

- **Descripción:** Devuelve el listado paginado de pagos asociados a reservas del usuario autenticado. Funciona tanto para cuentas `patient` como `professional` y solo muestra pagos de bookings donde el usuario es participante (como paciente o profesional).
- **Autenticación:** Requiere header `Authorization: Bearer <token>` y rol `ROLE_USER` con `type_account` en `[patient, professional]`.
- **Paginación (query params):**
  - `page` (int, opcional, por defecto 1, mínimo 1)
  - `limit` (int, opcional, por defecto 25, rango 1..100)
  - Cálculo interno de `offset = (page - 1) * limit`.
  
 - **Filtros (query params opcionales):**
  - `startDate`: ISO 8601 (ej. `2025-11-01T00:00:00Z`) o fecha `YYYY-MM-DD`. Aplica `p.createdAt >= startDate`.
  - `endDate`: ISO 8601 o `YYYY-MM-DD`. Si envías solo `YYYY-MM-DD`, el backend ajusta a `23:59:59` (inclusive) y aplica `p.createdAt <= endDate`.
  - `paymentStatus`: uno de `initiated`, `processing`, `pending_provider`, `approved`, `rejected`.
- **Campos por item (PaymentListDTO):**
  - `paymentUid`: UID del pago.
  - `amount`: Monto en centavos/unidad mínima (int) según currency asociada al pago (la currency no se expone en este listado, solo en el detalle `GET /api/payments/{uid}`).
  - `amountDecimal`: Monto en decimal legible con 2 decimales (string), útil para UI.
  - `status`: Estado del pago. Valores posibles (enum `PaymentStatusEnum`): `INITIATED`, `PROCESSING`, `PENDING_PROVIDER`, `APPROVED`, `REJECTED`.
  - `createdAt`: Fecha/hora de creación en formato ISO 8601 (DATE_ATOM).
  - `booking`: Objeto con datos resumidos de la reserva:
    - `uid`: UID de la reserva.
    - `dateBookingStart`: Fecha/hora de inicio (ISO 8601).
    - `status`: Estado actual de la reserva.
  - `professionalName`: Nombre completo del profesional (string o `null` si no aplica o datos incompletos).
  - `patientName`: Nombre completo del paciente (string o `null`).

- **Ejemplos de uso (curl):**
  - Sin filtros (paginado):
    ```bash
    curl -sS "{{base_url}}/api/payments?page=1&limit=25" \
      -H "Authorization: Bearer <token>"
    ```
  - Por rango de fechas (inclusive):
    ```bash
    curl -sS "{{base_url}}/api/payments?startDate=2025-11-01&endDate=2025-11-18" \
      -H "Authorization: Bearer <token>"
    ```
  - Por estado específico:
    ```bash
    curl -sS "{{base_url}}/api/payments?paymentStatus=captured" \
      -H "Authorization: Bearer <token>"
    ```

- **Respuesta 200 (ejemplo – usuario paciente):**
```json
{
  "page": 1,
  "limit": 25,
  "data": [
    {
      "paymentUid": "6f2e9b4c7d8a4e1fb223445566778899",
      "amount": 150000,
      "status": "PROCESSING",
      "createdAt": "2025-11-17T10:35:12+00:00",
      "booking": {
        "uid": "b3a7d1e2-f913-4c2d-a8b0-11aa22bb33cc",
        "dateBookingStart": "2025-11-20T14:00:00+00:00",
        "status": "confirmed"
      },
      "professionalName": "Dra. Ana Pérez",
      "patientName": "Juan Gómez"
    }
  ]
}
```

- **Respuesta 200 (ejemplo – usuario profesional):**
```json
{
  "page": 2,
  "limit": 10,
  "data": [
    {
      "paymentUid": "9aa8bb77cc66554433221100ffeeddcc",
      "amount": 200000,
      "status": "APPROVED",
      "createdAt": "2025-11-10T09:15:44+00:00",
      "booking": {
        "uid": "c7d8e9f0-a1b2-4c3d-9e8f-55aa66bb77cc",
        "dateBookingStart": "2025-11-12T09:00:00+00:00",
        "status": "completed"
      },
      "professionalName": "Lic. Carlos Ruiz",
      "patientName": "María Pérez"
    }
  ]
}
```

- **Respuesta sin pagos (ejemplo):**
```json
{ "page": 1, "limit": 25, "data": [] }
```

- **Errores comunes:**
  - `401` – No autenticado.
    ```json
    { "error": "Acceso no permitido" }
    ```
  - `403` – Tipo de cuenta no válido (ni paciente ni profesional).
    ```json
    { "error": "Acceso no permitido" }
    ```

- **Notas:**
  - El campo `currency` no se incluye en este listado; para conocerlo usar el endpoint de detalle `GET /api/payments/{uid}`.
  - `amount` se devuelve en la unidad mínima (centavos si la currency es basada en 100). Conversión/formato amigable debe hacerse en frontend.
  - Los nombres (`professionalName`, `patientName`) pueden ser `null` si falta información en la reserva.
  - La paginación no devuelve el total de elementos; si se requiere, agregar un endpoint o ampliar respuesta futura con `total`.
  - Solo se listan pagos pertenecientes a reservas del usuario autenticado (no hay acceso cruzado a pagos de terceros).
## Consultas

### Listar mis consultas (profesional o paciente)

**GET** `/api/my-consultations`

- Descripción: Devuelve las consultas asociadas al usuario autenticado. Soporta cuentas `professional` y `patient`.
- Autenticación: Requiere `Authorization: Bearer <token>` con `type_account` en `['professional','patient']`.
- Comportamiento según tipo:
  - Profesional: obtiene todas las consultas de reservas donde es el profesional.
  - Paciente: obtiene todas las consultas de reservas donde es el paciente.
- Campos por item:
  - `uid`: UID de la consulta.
  - `date_booking_start`: Fecha/hora de inicio de la reserva asociada. Formato `YYYY-MM-DD HH:MM`.
  - `reason`: Motivo (se toma de `reserveReason` o del detalle `reasonConsultation`).
  - `professionalUid`: UID del profesional asociado a la reserva.
  - `professionalName`: Nombre completo del profesional.
  - `patientUid`: UID del paciente asociado a la reserva.
  - `patientName`: Nombre completo del paciente.

Ejemplo (respuesta 200 – usuario profesional):
```json
[
  {
    "uid": "c0a8012b-1a2b-3c4d-5e6f-77889900aabb",
    "date_booking_start": "2025-10-29 10:00",
    "reason": "Dolor persistente",
    "professionalUid": "8c7c8d3a-8f1e-42a9-bc8d-2a7e9d1a3c4b",
    "professionalName": "Dra. Ana Pérez",
    "patientUid": "9aa81234-7b2c-4e55-a901-55aa22bb33cc",
    "patientName": "Juan Gómez"
  }
]
```

Ejemplo (respuesta 200 – usuario paciente):
```json
[
  {
    "uid": "d9e32d49-8ce1-4648-990f-4d8ca2387eac",
    "date_booking_start": "2025-11-12 09:00",
    "reason": "Ansiedad generalizada",
    "professionalUid": "222c8d3a-8f1e-42a9-bc8d-2a7e9d1a3c4b",
    "professionalName": "Dr. Abel Mena",
    "patientUid": "33381234-7b2c-4e55-a901-55aa22bb33cc",
    "patientName": "María Pérez"
  }
]
```

Errores comunes:
```json
{ "code": 401, "message": "No autenticado" }
{ "code": 403, "message": "Tipo de cuenta no válido. Solo profesionales o pacientes" }
```

---

### Listar consultas de un paciente (solo profesionales autorizados)

**GET** `/api/{uid_patient}/consultations`

- Descripción: Lista las consultas de un paciente específico.
- Autenticación: Requiere `Authorization: Bearer <token>` con cuenta profesional.
- Autorización: Solo profesionales que tengan al menos una reserva con ese paciente pueden ver el listado.
- Campos por item:
  - `professionalName`: Prefijo + nombre y apellido del profesional que realizó la consulta.
  - `date_booking_start`: Fecha/hora de inicio de la reserva asociada. Formato `YYYY/MM/DD HH:MM`.
  - `reason`: Motivo (valor normalizado desde `consultation_detail`).
  - `uid`: UID de la consulta.

Ejemplo de respuesta 200:
```json
[
  {
    "professionalName": "Dr. Carlos Ruiz",
    "date_booking_start": "2025/10/15 16:00",
    "reason": "Ansiedad generalizada",
    "uid": "a1b2c3d4-e5f6-7890-abcd-ef0123456789"
  }
]
```

- Errores comunes:
  - `401` – No autenticado.
  - `403` – Profesional sin reservas con el paciente indicado.
  - `404` – Paciente no encontrado.

---

## Perfil de paciente para profesionales

### GET `/api/{uid_patient}/patient-profile`

- Descripción: Devuelve el perfil de un paciente para ser visualizado por profesionales.
- Autenticación: Requiere `Authorization: Bearer <token>` con cuenta profesional.
- Respuesta: Todos los campos equivalentes a `GET /api/me` cuando el usuario es paciente, más el flag:
  - `hasReservations`: booleano que indica si el profesional autenticado tiene reservas con ese paciente.

Ejemplo de respuesta 200 (parcial):
```json
{
  "uid": "p-123",
  "email": "paciente@correo.com",
  "first_name": "María",
  "last_name": "Pérez",
  "type_account": "patient",
  "details": { },
  "studies": [ ],
  "professions": [ ],
  "hasReservations": true
}
```

- Errores comunes:
  - `401` – No autenticado.
  - `403` – El usuario autenticado no es profesional.
  - `404` – Paciente no encontrado.

---

## Billetera (Wallet)

### Obtener mi wallet (solo profesional)

**GET** `/api/wallet`

- Descripción: Devuelve el estado de la billetera del profesional autenticado, incluyendo saldos y movimientos.
- Autenticación: Requiere `Authorization: Bearer <token>` con cuenta profesional (`type_account = professional`).
- Respuesta 200:
  ```json
  {
    "walletUid": "9b6caa2c-0b5a-4f3a-9d18-2fd2b1c6c1f1",
    "availableBalance": "120.00",
    "frozenBalance": "30.00",
    "balanceTotal": "150.00",
    "movements": [
      {
        "uid": "ldg-1",
        "amount": "30.00",
        "operationType": "CREDIT",
        "paymentUid": "pay-auth-001",
        "status": "authorized",
        "description": "Reserva: sesión inicial",
        "createdAt": "2025-11-18T12:00:00+00:00"
      },
      {
        "uid": "ldg-2",
        "amount": "120.00",
        "operationType": "CREDIT",
        "paymentUid": "pay-cap-001",
        "status": "captured",
        "description": "Reserva: evaluación clínica",
        "createdAt": "2025-11-18T13:00:00+00:00"
      },
      {
        "uid": "ldg-3",
        "amount": "20.00",
        "operationType": "DEBIT",
        "paymentUid": "pay-ref-001",
        "status": "refunded",
        "description": "Reembolso parcial",
        "createdAt": "2025-11-18T14:00:00+00:00"
      }
    ]
  }
  ```

- Errores comunes:
  - `401` – No autenticado.
    ```json
    { "error": "Autenticación requerida." }
    ```
  - `403` – Cuenta autenticada sin rol profesional.
    ```json
    { "error": "Acceso no permitido" }
    ```
  - `404` – El profesional aún no tiene wallet creada.
    ```json
    { "error": "Wallet not found" }
    ```

- Ejemplo (curl):
  ```bash
  curl -X GET "{{base_url}}/api/wallet" \
    -H "Authorization: Bearer <token>" \
    -H "Accept: application/json"
  ```

#### Campos de la respuesta
- `walletUid`: UID de la billetera del profesional.
- `availableBalance`: Saldo disponible (en formato decimal con 2 decimales).
- `frozenBalance`: Saldo congelado/pendiente (en formato decimal con 2 decimales).
- `balanceTotal`: Suma de `availableBalance + frozenBalance`.
- `movements[]`: Lista de movimientos históricos calculados desde `wallet_ledgers`:
  - `uid`: UID del movimiento.
  - `amount`: Monto del movimiento (2 decimales).
  - `operationType`: `CREDIT` o `DEBIT`.
  - `paymentUid`: UID del pago asociado.
  - `status`: Estado actual del pago asociado (p. ej., `approved`, `rejected`).
  - `description`: Texto amigable (notas o motivo de la reserva cuando está disponible).
  - `createdAt`: Fecha/hora del movimiento en formato ISO 8601.

#### Flujo de saldos y generación de movimientos
El backend garantiza la creación y el recálculo de saldos mediante un subscriber de estados de pago:

- `APPROVED` (Aprobado):
  - Se crea un movimiento `CREDIT` asociado al pago y su monto se contabiliza como `availableBalance` (o `frozenBalance` según reglas de negocio temporales).

- `REJECTED` (Rechazado):
  - No genera movimientos de crédito, o revierte intentos previos si existieran lógicas de pre-autorización.

Notas importantes:
- Los montos se muestran con 2 decimales en todas las cifras.
- La descripción de cada movimiento proviene de las notas o motivo de la reserva, si existen; de lo contrario, se indica el pago relacionado.
- El endpoint solo está disponible para usuarios con `type_account = professional`.

---

## Retiros (Withdrawals)

### Listar mis retiros

**GET** `/api/withdrawals`

- **Descripción:** Devuelve el historial de solicitudes de retiro del profesional autenticado.
- **Autenticación:** Requiere `Authorization: Bearer <token>` y cuenta profesional.
- **Parámetros (Query):**
  - `order`: `ASC` o `DESC` (por defecto `DESC`). Ordena por fecha de creación.
- **Respuesta 200:**
  ```json
  [
    {
      "uid": "a1b2c3d4...",
      "amount": "500.00",
      "status": "pending",
      "date": "2025-11-27T10:00:00+00:00",
      "reason": "Pago mensual",
      "method": "bank_transfer"
    }
  ]
  ```

  ### Solicitar retiro

**POST** `/api/withdrawals`

- **Descripción:** Crea una nueva solicitud de retiro de fondos de la billetera profesional.
- **Autenticación:** Requiere `Authorization: Bearer <token>` y cuenta profesional con billetera activa.
- **Body (JSON):**
  ```json
  {
    "amount": 500.00,
    "reason": "Pago de servicios",
    "dni": "12345678",
    "withdrawalMethod": "bank_transfer"
  }
  ```
- **Campos:**
  - `amount`: numérico, mayor a 0. Mínimo 50.
  - `reason`: string (opcional).
  - `dni`: string (requerido). Debe coincidir con el DNI del perfil del usuario.
  - `withdrawalMethod`: string. Valores permitidos según configuración (ej. `bank_transfer`, `internal_wallet`, `crypto`).
- **Validaciones:**
  - El usuario debe tener saldo disponible suficiente (`available_balance`).
  - El usuario debe tener configurado su DNI en el perfil.
  - Solo se permite un retiro cada 24 horas.
- **Respuesta 201 (Creado):**
  ```json
  {
    "message": "Solicitud de retiro creada exitosamente",
    "uid": "e5f6g7h8...",
    "status": "pending",
    "new_balance": "4500.00"
  }
  ```
- **Errores comunes:**
  - `400` – Datos inválidos, saldo insuficiente, límite de frecuencia (24h), DNI no coincide.
  - `403` – No tiene billetera profesional.

  ## Reembolsos (Refunds)

  ### Solicitar reembolso

  **POST** `/api/refunds`

  - **Descripción:** Solicita un reembolso parcial o completo para una reserva pagada. El monto debe permanecer dentro del saldo capturado menos lo ya reembolsado.
  - **Autenticación:** `Authorization: Bearer <token>` y rol `ROLE_USER`. El paciente creado en el reembolso debe coincidir con la reserva objetivo.
  - **Body (JSON):**
    ```json
    {
      "booking_uid": "uid-de-la-reserva",
      "patient_uid": "uid-del-paciente",
      "amount": 150.00,
      "reason": "Motivo del reembolso",
      "refundMethod": "bank_transfer"
    }
    ```
  - **Validaciones:**
    - Todos los campos son obligatorios (excepto `refundMethod` que es opcional).
    - `amount` debe ser numérico y mayor a cero (se convierte a centavos internamente).
    - La reserva debe existir, tener profesional asignado y pagos capturados.
    - No puede superar el saldo remanente (pagado menos ya reembolsado).
  - **Respuesta 201:**
    ```json
    {
      "refund_id": "uid-del-reembolso",
      "status": "pending",
      "frozen_amount": "30.00"
    }
    ```
    - `frozen_amount` refleja el nuevo saldo congelado del profesional.
  - **Errores comunes:**
    - `400` – Campos faltantes, monto inválido, reserva sin profesional o el monto solicitado excede lo reembolsable.
    - `404` – Reserva o paciente no encontrados.

  ### Listar reembolsos

  **GET** `/api/refunds`

  - **Descripción:** Devuelve los reembolsos que coinciden con los filtros opcionales.
  - **Autenticación:** `Authorization: Bearer <token>` y rol `ROLE_USER`.
  - **Query params opcionales:**
    - `page` (int, por defecto 1)
    - `per_page` (int, por defecto 10)
    - `status` (ej: `pending`, `approved`, `rejected`)
    - `patient_uid`
    - `booking_uid`
  - **Respuesta 200 (ejemplo):**
    ```json
    [
      {
        "uid": "refund-1",
        "booking_uid": "booking-123",
        "patient_uid": "user-1",
        "professional_uid": "pro-1",
        "amount": 150.00,
        "status": "pending",
        "created_at": "2025-11-18T12:00:00+00:00",
        "updated_at": "2025-11-18T12:00:00+00:00",
        "reason": "Cancelación de consulta"
      }
    ]
    ```
    Se devuelve un array (puede estar vacío) y siempre responde `200`.

  ### Detalle de un reembolso

  **GET** `/api/refunds/{id}`

  - **Descripción:** Muestra la información completa del reembolso y las entradas de libro mayor asociadas.
  - **Autenticación:** `Authorization: Bearer <token>` y rol `ROLE_USER`.
  - **Respuesta 200 (ejemplo):**
    ```json
    {
      "uid": "refund-1",
      "booking_uid": "booking-123",
      "patient_uid": "user-1",
      "professional_uid": "pro-1",
      "amount": 150.00,
      "status": "pending",
      "created_at": "2025-11-18T12:00:00+00:00",
      "updated_at": "2025-11-18T12:00:00+00:00",
      "reason": "Cancelación",
      "admin_note": null,
      "ledger_entries": [
        {
          "id": "ldg-refund-1",
          "amount": 150.00,
          "operation_type": "DEBIT",
          "created_at": "2025-11-18T12:01:00+00:00",
          "payment_id": "payment-1",
          "payment_status": "refunded"
        }
      ]
    }
    ```
  - **Errores:**
    - `404` – Reembolso no encontrado.
