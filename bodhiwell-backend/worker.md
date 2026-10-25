# ⚙️ Configuración del Worker de Mensajería (Symfony Messenger)

Para procesar el transporte de correos y notificaciones de forma asíncrona (`async_emails`), utilizamos **Supervisor** en el servidor de producción. Esto garantiza que el comando de Symfony se mantenga siempre activo y se reinicie automáticamente si falla o alcanza sus límites.

## 1. Requisitos Previos

*   Ubuntu Server con PHP 8.3 instalado.
*   Extensiones `php-redis`, `php-mbstring` e `php-intl` activas.
*   Servidor Redis en ejecución (Ver [redis.md](redis.md)).

## 2. Instalación de Supervisor

Supervisor es un sistema de control de procesos que permite monitorear y controlar procesos en sistemas operativos tipo UNIX.

```bash
sudo apt update
sudo apt install supervisor
```

## 3. Configuración del Proceso

Debemos crear un archivo de configuración para nuestro worker específico.

1.  **Crear el archivo:**
    ```bash
    sudo nano /etc/supervisor/conf.d/symfony-worker.conf
    ```

2.  **Pegar el siguiente contenido** (ajustar las rutas `/var/www/proyecto` a la ruta real de tu despliegue):

    ```ini
    [program:symfony-worker]
    # Comando optimizado para estabilidad y rendimiento
    command=php /var/www/proyecto/bin/console messenger:consume async_emails --limit=50 --sleep=10 --memory-limit=128M -vv

    # Usuario que ejecuta el proceso (debe ser el mismo de Nginx/PHP-FPM, usualmente www-data)
    user=www-data

    # Gestión de reinicio automático
    autostart=true
    autorestart=true

    # Tiempo de espera para considerar que arrancó bien
    startsecs=1

    # Gestión de Logs (útil para debugging)
    stdout_logfile=/var/www/proyecto/var/log/messenger-worker.out.log
    stderr_logfile=/var/www/proyecto/var/log/messenger-worker.err.log

    # Número de instancias (si necesitas procesar más correos en paralelo, aumenta este número)
    numprocs=1
    process_name=%(program_name)s_%(process_num)02d
    ```

## 4. Activación del Worker

Una vez creado el archivo, ejecutamos los comandos para que Supervisor lo reconozca y lo inicie:

```bash
# Notificar a supervisor de nuevos archivos de configuración
sudo supervisorctl reread

# Aplicar los cambios y arrancar el proceso
sudo supervisorctl update

# Verificar el estado
sudo supervisorctl status
```

## 5. Mantenimiento y Comandos Útiles

### Ver estado del proceso
```bash
sudo supervisorctl status symfony-worker
```

### Reiniciar el worker
**⚠️ OBLIGATORIO:** Debes reiniciar el worker después de cada despliegue de código nuevo para que cargue los cambios de PHP:
```bash
sudo supervisorctl restart symfony-worker
```

### Ver logs en tiempo real
```bash
tail -f /var/www/proyecto/var/log/messenger-worker.out.log
```

## 6. Explicación de los parámetros del comando

*   `--limit=50`: El proceso se detendrá tras procesar 50 mensajes. Supervisor lo reiniciará inmediatamente. Esto previene fugas de memoria (memory leaks) comunes en procesos PHP de larga duración.
*   `--sleep=10`: Si la cola está vacía, el proceso esperará 10 segundos antes de volver a consultar a Redis, reduciendo drásticamente el consumo de CPU.
*   `--memory-limit=128M`: Si el proceso excede este consumo de RAM, se detiene automáticamente para proteger la estabilidad del servidor.
*   `-vv`: Nivel de verbosidad "Very Verbose" para registrar detalles suficientes en los archivos de log ante cualquier error.
