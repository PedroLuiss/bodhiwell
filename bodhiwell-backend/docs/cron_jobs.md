# Configuración y Pruebas de Cron Jobs (Tareas Programadas)

Este documento detalla los Cron Jobs requeridos por el sistema BodhiWell y cómo configurarlos en entornos de producción y pruebas.

## 1. Cron Job: Cancelación de Reservas Expiradas

**Comando:** `app:check-booking-expiration`
**Frecuencia sugerida:** Cada 5 minutos.
**Descripción:** Verifica todas las reservas en estado `WAITING_PAYMENT` que se crearon hace más de 45 minutos y las cancela automáticamente (Estado `CANCELLED`, nota "TIMEOUT...").

---

### A. Despliegue en Producción (Linux)

Para que esta tarea se ejecute automáticamente, debes añadir una entrada al `crontab` del usuario que ejecuta la aplicación web (usualmente `www-data` o el usuario deployer).

1.  Abre el editor de crontab:
    ```bash
    crontab -e
    ```

2.  Añade la siguiente línea al final del archivo:
    ```cron
    # Verificar reservas expiradas cada 5 minutos
    */5 * * * * cd /ruta/a/tu/proyecto && php bin/console app:check-booking-expiration >> /var/log/cron_booking_cancel.log 2>&1
    ```

    *   Reemplaza `/ruta/a/tu/proyecto` por la ruta real (ej: `/var/www/bodhiwell-backend`).
    *   Asegúrate de que el ejecutable `php` esté en el PATH o usa la ruta absoluta (ej: `/usr/bin/php`).

---

### B. Pruebas Manuales en Local

Sigue estos pasos para verificar que el sistema de cancelación funciona correctamente en tu entorno de desarrollo.

#### 1. Identificar o Crear una Reserva
Necesitas una reserva en estado `WAITING_PAYMENT`.
```bash
# Ver última reserva pendiente
php bin/console doctrine:query:sql "SELECT id, uid, created_at FROM booking WHERE status = 'WAITING_PAYMENT' ORDER BY id DESC LIMIT 1"
```

#### 2. Simular el paso del tiempo ("Envejecer" la reserva)
Modifica manualmente la fecha de creación de la reserva para que sea mayor a 45 minutos (ej: 60 minutos atrás).
*Reemplaza `ID_DE_RESERVA` con el ID obtenido en el paso anterior.*

```bash
# Restar 60 minutos a la fecha de creación
php bin/console doctrine:query:sql "UPDATE booking SET created_at = DATE_SUB(NOW(), INTERVAL 60 MINUTE) WHERE id = ID_DE_RESERVA"
```

#### 3. Ejecutar el Comando
Corre manualmente el comando que el servidor ejecutaría automáticamente.

```bash
php bin/console app:check-booking-expiration
```

**Resultado esperado:**
*   Deberías ver un mensaje: `[OK] Cancelled 1 expired bookings.` (o el número correspondiente).

#### 4. Verificar el Resultado
Comprueba que la reserva ha cambiado de estado.

```bash
php bin/console doctrine:query:sql "SELECT uid, status, notes FROM booking WHERE id = ID_DE_RESERVA"
```
*   **Status:** `CANCELLED`
*   **Notes:** Debe contener "...TIMEOUT: Reserva expirada..."
