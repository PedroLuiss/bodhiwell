# 🦅 Instalación y Configuración de Redis

Para que el sistema de colas y notificaciones funcione correctamente, es necesario contar con un servidor Redis operativo.

## 1. Requisitos Previos
- Ubuntu Server / Debian.
- Extensiones PHP recomendadas: `php-redis` (o `php8.3-redis` según tu versión).

## 2. Instalación en Ubuntu/Debian

```bash
# Actualizar los repositorios
sudo apt update

# Instalar el servidor Redis
sudo apt install redis-server

# (Opcional) Instalar la extensión de PHP si no la tienes
sudo apt install php8.3-redis
```

## 3. Configuración Básica

Por defecto, Redis se ejecuta en `localhost` (127.0.0.1) en el puerto `6379`, y sin contraseña.

### Habilitar Redis como servicio (Daemon)
Para que Redis se inicie automáticamente al arrancar el servidor:

```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### Verificar Estado
```bash
sudo systemctl status redis-server
```

### Probar conexión
Ejecuta el cliente de Redis y haz un ping:
```bash
redis-cli ping
# Respuesta esperada: PONG
```

## 4. Configuración en la Aplicación Symfony (`.env`)

En tu archivo `.env`, define la variable `REDIS_URL`.

**Sin contraseña (Local/Default):**
```bash
REDIS_URL=redis://127.0.0.1:6379
```

**Con contraseña (Producción Recomendado):**
```bash
REDIS_URL=redis://:TU_CONTRASEÑA@127.0.0.1:6379
```
*(Si Redis tiene `requirepass` activado en `/etc/redis/redis.conf`)*.
