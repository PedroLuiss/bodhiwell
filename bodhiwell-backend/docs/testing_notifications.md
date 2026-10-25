# 🧪 Guía de Pruebas: Sistema de Notificaciones (Bodhiwell)

Esta guía describe el flujo completo para validar el envío de correos y recordatorios en el entorno de desarrollo y producción.

## 1. Limpieza de Entorno
Si encuentras errores de serialización o cambios en las clases de los mensajes (`Message\SendBookingEmailMessage`), es necesario limpiar la cola.

**Pasos para limpiar:**
1. Detener workers activos (Ctrl+C).
2. Ejecutar limpieza de mensajes fallidos/viejos:
   ```bash
   php bin/console messenger:stop-workers
   redis-cli flushall
   ```
   *(Nota: `redis-cli flushall` borrará TODA la caché de Redis. Úsalo con precaución en desarrollo).*

## 2. Iniciar el Procesador de Correos (Worker)
Para que los correos salgan de la cola asíncrona (`async_emails`) y se envíen (a Mailtrap o proveedor real), debes tener el worker corriendo:

```bash
php bin/console messenger:consume async_emails -vv
```
*Debe mostrar: `[OK] Consuming messages from transport "async_emails".`*
*Déjalo corriendo en una terminal dedicada mientras realizas las pruebas.*

## 3. Disparar Pruebas

### A. Prueba de Conexión Básica (SMTP)
Envía un correo simple para verificar que las credenciales `.env` (MAILER_DSN) son correctas.
```bash
php bin/console app:test-email
```
*(Nota: Este comando envía un correo de prueba básico. Verifica el código si necesitas cambiar el destinatario).*

### B. Prueba de Renderizado (HTML)
Verifica cómo se ven visualmente los correos (incluyendo el logo y estilos) sin enviarlos realmente.
```bash
php bin/console app:preview-all-emails
```
*Esto generará archivos HTML en `public/email_previews/`. Abre `http://localhost:8000/email_previews/index.html` en tu navegador para ver la galería.*

### C. Prueba de Recordatorios de Reservas
Este comando busca reservas confirmadas para el día siguiente y envía los recordatorios correspondientes.
```bash
php bin/console app:send-booking-reminders
```
*Esto generará actividad en la terminal del worker si hay reservas que cumplan la condición (mañana).*

## 4. Configuración CRON (Producción)
Para que los recordatorios de reservas se envíen automáticamente cada mañana (ej. 08:00 AM), añade la siguiente línea al crontab del servidor:

```bash
Para asegurar que se envíen recordatorios incluso para citas agendadas el mismo día (ej: cita en la tarde creada en la mañana), se recomienda ejecutar el comando **cada hora**:

```bash
0 * * * * cd /var/www/projects/bodhiwell/bodhiwell-backend && php bin/console app:send-booking-reminders >> /var/log/cron-reminders.log 2>&1
```

*Nota: Al correr cada hora, el sistema revisará constantemente si hay nuevas citas próximas para enviarles su aviso a tiempo.*
