# 🛠️ Symfony Installation Guide

## 📌 1. Requisitos previos
Antes de iniciar un nuevo proyecto con esta plantilla, asegúrate de contar con las siguientes herramientas:
- **PHP 8.2+**
- **Composer** (`curl -sS https://getcomposer.org/installer | php`)
- **Symfony CLI** (`curl -sS https://get.symfony.com/cli | bash`)
- **Node.js y Yarn** (para activos frontend)
- **Base de datos MySQL/PostgreSQL** según el proyecto

## 💻 2. Instalación en local
### 📌 Clona el repositorio y configura el entorno de desarrollo:
git clone https://bitbucket.org/softmenaca/template-base-symfony.git cd symfony-project 
```sh
composer install
```

### 📌 Configura las variables de entorno en `.env`:
APP_ENV=dev DATABASE_URL="mysql://root:@127.0.0.1:3306/symfony_db?serverVersion=8.0.32&charset=utf8mb4" JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem

### 📌 Genera claves JWT si usas autenticación:
```sh
php bin/console lexik:jwt:generate-keypair
```

### 📌 Ejecuta las migraciones y levanta el servidor de desarrollo:
```sh
php bin/console doctrine:migrations:migrate
php bin/console d:s:u --dump-sql --complete -f
symfony server:start
```


✅ Ahora puedes acceder a **Symfony en local** desde `https://127.0.0.1:8000`.

## 🌍 3. Instalación en un servidor Ubuntu
### 📌 Instala dependencias y configura el entorno:
sudo apt update && sudo apt upgrade -y sudo apt install php8.1-cli php8.1-mysql php8.1-xml php8.1-mbstring php8.1-curl unzip git curl curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

### 📌 Clona el repositorio en el servidor y configura Symfony:
git clone git@bitbucket.org:softmenaca/template-base-symfony.git /var/www/symfony cd /var/www/symfony composer install --no-dev

### 📌 Configura el entorno en `.env.prod.local`:
APP_ENV=prod DATABASE_URL="mysql://user:password@localhost:3306/symfony_db"

### 📌 Configura permisos y levanta Symfony con Nginx/Apache:
```sh
chown -R www-data:www-data /var/www/symfony php bin/console cache:clear
```

✅ Ahora puedes acceder a Symfony desde tu servidor en producción.

## 🔄 4. Comandos útiles
### 📌 Cargar fixtures (datos de prueba):
```sh
php bin/console doctrine:fixtures:load
```
> 📘 **[Ver Guía Detallada de Fixtures](docs/fixtures.md)**

### 📌 Ver logs de Symfony:
```sh
tail -f var/log/dev.log
```

### 📌 Reiniciar el servidor Symfony en local:
```sh
symfony server:restart
```

## 🔔 Webhooks de Plexo (prueba)

Este proyecto expone dos endpoints para recibir webhooks desde Plexo (modo prueba/validación inicial):

- Instrument: `POST /webhook/plexo/instrument`
- Transaction: `POST /webhook/plexo/transaction`

Configuración sugerida en el panel de Plexo:

- URL de webhook Instrument: `https://TU-DOMINIO/webhook/plexo/instrument`
- URL de webhook Transaction: `https://TU-DOMINIO/webhook/plexo/transaction`
- Método: `POST`
- Content-Type: `application/json`

Notas:

- Por ahora se registran todos los datos recibidos en logs (`var/log/dev.log`).
- Si el payload trae un `InstrumentToken` (o equivalente), se guarda como ejemplo en `var/plexo/instrument_tokens.jsonl`.
	Reemplazar por persistencia en base de datos cuando el modelo esté definido.

### Cómo probar en local

1) Levanta el servidor de Symfony (si no está corriendo):

```sh
symfony server:start -d
```

2) Envía un POST de prueba al webhook de Instrument:

```sh
curl -X POST "http://127.0.0.1:8000/webhook/plexo/instrument" \
	-H "Content-Type: application/json" \
	-d '{
		"instrumentToken": "tok_test_123",
		"instrument": {"token": "tok_nested_456"},
		"example": true
	}'
```

3) Envía un POST de prueba al webhook de Transaction:

```sh
curl -X POST "http://127.0.0.1:8000/webhook/plexo/transaction" \
	-H "Content-Type: application/json" \
	-d '{
		"id": "txn_001",
		"amount": 1000,
		"currency": "USD",
		"status": "approved"
	}'
```

4) Verifica resultados:


- Logs: `tail -f var/log/dev.log`
- Tokens guardados: `cat var/plexo/instrument_tokens.jsonl`

## 📧 Infraestructura de Notificaciones y Colas

Este proyecto utiliza un sistema de colas asíncrono robusto basado en **Symfony Messenger** y **Redis**.

Para configurar, instalar y desplegar este sistema, consulta la documentación detallada:

1.  🔴 **[Instalación de Redis (redis.md)](redis.md)**: Guía de instalación del servidor de colas.
2.  ⚙️ **[Configuración del Worker (worker.md)](worker.md)**: Guía para desplegar el consumidor de mensajes con **Supervisor** en producción.

### Comando rápido (Desarrollo Local)
Para probar el envío de correos mientras desarrollas:
```bash
php bin/console messenger:consume async_emails --limit=10 --memory-limit=128M -vv
or
php bin/console messenger:consume async_emails --limit=50 -vv
```
