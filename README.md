# Bodhiwell

Monorepo de la plataforma **Bodhiwell**. Reúne los dos proyectos de la aplicación y el manual de diseño:

| Carpeta | Proyecto | Stack principal |
| --- | --- | --- |
| [`bodhiwell-backend`](bodhiwell-backend/) | API REST y backoffice | PHP 8.2+ · Symfony 7.2 · Doctrine ORM · MySQL/PostgreSQL · Redis · JWT · Firebase |
| [`bodhiwell-spa`](bodhiwell-spa/) | Aplicación web (SPA) | React 19 · TypeScript · Create React App · React Router · MUI/Bootstrap · Firebase |
| [`manual-bodhiwell-V4`](manual-bodhiwell-V4/) | Manual de diseño y componentes | HTML · CSS · JS (estático) |

> El backend y la SPA vivían originalmente en repositorios privados separados. Este repositorio los unifica para tener el proyecto completo en un solo lugar.

---

## Requisitos generales

| Herramienta | Versión recomendada | Uso |
| --- | --- | --- |
| PHP | 8.2 o superior (con `ctype`, `iconv`, `pdo_mysql`/`pdo_pgsql`) | Backend |
| Composer | 2.x | Dependencias del backend |
| Symfony CLI | Última | Servidor local del backend (opcional) |
| MySQL | 8.0+ | Base de datos (opción por defecto) |
| PostgreSQL | 16+ | Base de datos (alternativa / Docker) |
| Redis | 7+ | Cola de correos del backend (opcional en desarrollo) |
| Node.js | 18 o 20 LTS | SPA |
| npm | 9+ | Dependencias de la SPA |
| Docker | Opcional | Base de datos y Mailpit sin instalar servicios |

---

## 1. Backend — `bodhiwell-backend`

API REST en Symfony con autenticación JWT, backoffice EasyAdmin, notificaciones Firebase, cola de correos con Redis/Messenger y webhooks de Plexo.

### 1.1 Instalar dependencias

```bash
cd bodhiwell-backend
composer install
```

### 1.2 Configurar variables de entorno

Copia la plantilla y edítala:

```bash
cp .env.example .env
```

En Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

Variables mínimas a revisar en `.env`:

```dotenv
APP_ENV=dev
APP_DEBUG=1
APP_URL=http://127.0.0.1:8000

# MySQL (opción por defecto)
DATABASE_URL="mysql://root:@127.0.0.1:3306/bodhiwell_db?serverVersion=8.3.0&charset=utf8mb4"

# O PostgreSQL
# DATABASE_URL="postgresql://app:!ChangeMe!@127.0.0.1:5432/app?serverVersion=16&charset=utf8"

JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=cambia-esta-clave

# Redis (necesario para la cola de correos)
REDIS_URL=redis://127.0.0.1:6379

# Firebase (opcional en local)
FIREBASE_CREDENTIALS_PATH=
```

> Los archivos `.env`, las llaves JWT y `config/firebase/firebase_credentials.json` **no se versionan**. Pídelos al equipo o genera tus propias llaves.

### 1.3 Generar llaves JWT

```bash
php bin/console lexik:jwt:generate-keypair
```

Esto crea `config/jwt/private.pem` y `config/jwt/public.pem`. Si ya existen, puedes omitir este paso.

### 1.4 Crear la base de datos y migrar

```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate -n
```

Cargar datos de prueba (opcional):

```bash
php bin/console doctrine:fixtures:load
```

### 1.5 Levantar el servidor

Con Symfony CLI:

```bash
symfony server:start
```

O con el servidor embebido de PHP:

```bash
php -S 127.0.0.1:8000 -t public
```

API disponible en **http://127.0.0.1:8000**. El backoffice (EasyAdmin) queda bajo `/admin`.

### 1.6 Base de datos y correo con Docker (opcional)

El proyecto incluye `compose.yaml` con PostgreSQL y Mailpit:

```bash
docker compose up -d
```

- PostgreSQL: puerto `5432` (ajusta `DATABASE_URL` a la variante PostgreSQL).
- Mailpit (correo de pruebas): interfaz en http://localhost:8025.

### 1.7 Redis y cola de correos (opcional)

Los correos masivos y de reservas se procesan en segundo plano con Symfony Messenger. Para consumirlos:

```bash
php bin/console messenger:consume async_emails -vv
```

Si no necesitas correos en desarrollo puedes dejar Redis sin levantar; el resto de la API funciona igual.

### 1.8 Comandos útiles

```bash
tail -f var/log/dev.log                 # logs (Linux/macOS)
Get-Content var/log/dev.log -Wait       # logs (PowerShell)
php bin/console cache:clear             # limpiar caché
php bin/console doctrine:fixtures:load  # datos de prueba
```

Documentación adicional del backend:

- [Guía de instalación Symfony](bodhiwell-backend/README.md)
- [Instalación de Redis](bodhiwell-backend/redis.md)
- [Configuración del worker](bodhiwell-backend/worker.md)
- [Guía de fixtures](bodhiwell-backend/docs/fixtures.md)

---

## 2. SPA — `bodhiwell-spa`

Aplicación web en React + TypeScript (Create React App) con React Router, i18n, Firebase Messaging, calendario y componentes MUI/Bootstrap.

### 2.1 Instalar dependencias

```bash
cd bodhiwell-spa
npm install
```

> También puedes usar `yarn install` (el proyecto declara Yarn 1.22 como `packageManager`), pero `npm` es suficiente.

### 2.2 Configurar variables de entorno

```bash
cp .env.example .env
```

En Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

Variables mínimas:

```dotenv
PORT=3010
REACT_APP_PORT=3010
REACT_APP_API_URL=http://127.0.0.1:8000/
```

- `REACT_APP_API_URL` debe apuntar al backend y **terminar en `/`**.
- Las variables `REACT_APP_FIREBASE_*` son opcionales; solo se necesitan para notificaciones push.

### 2.3 Ejecutar en desarrollo

```bash
npm start
```

Abre **http://localhost:3010** (el puerto se toma de `PORT` en `.env`; si no existe, CRA usa `3000`).

El script `npm start` genera antes `public/firebase-messaging-sw.js` a partir de `public/firebase-messaging-sw.template.js`.

### 2.4 Compilar para producción

```bash
npm run build
```

El resultado queda en la carpeta **`build/`** (Create React App), lista para servir con Nginx, Apache o un CDN.

### 2.5 Pruebas

```bash
npm test
```

Documentación adicional de la SPA: [README de la SPA](bodhiwell-spa/README.md).

---

## 3. Manual de diseño — `manual-bodhiwell-V4`

Es un sitio estático con el sistema de diseño, componentes y ejemplos de la plataforma. No requiere instalación ni build:

- Abre `manual-bodhiwell-V4/start-here.html` en el navegador, o
- sírvelo con cualquier servidor estático, por ejemplo:

```bash
cd manual-bodhiwell-V4
php -S 127.0.0.1:8080
```

---

## Puesta en marcha completa (resumen)

1. Levanta la base de datos (MySQL local o `docker compose up -d` en el backend).
2. Configura `bodhiwell-backend/.env` y ejecuta migraciones.
3. Arranca el backend en http://127.0.0.1:8000.
4. Configura `bodhiwell-spa/.env` con `REACT_APP_API_URL=http://127.0.0.1:8000/`.
5. Arranca la SPA con `npm start` en http://localhost:3010.
6. (Opcional) Levanta Redis y el worker de correos.

---

## Archivos que no se versionan

Por seguridad y tamaño, el `.gitignore` raíz excluye:

- `.env` y variantes (solo se versionan los `.env.example`).
- `config/firebase/firebase_credentials.json` y credenciales de Google Cloud.
- Llaves y certificados (`*.pem`, `*.key`, `*.crt`, etc.).
- Volcados de base de datos (`*.dump`, `*.sql`).
- `node_modules/`, `vendor/`, `var/`, `dist/`, `build/`, `uploads/` y logs.
- Carpetas de respaldo `.git_backup/`.

Si necesitas estos archivos para trabajar, solicítalos al equipo; **nunca los subas al repositorio**.

---

## Notas

- Este repositorio es la fuente unificada del código. El historial anterior de los repositorios privados originales se conserva solo en respaldos locales, no aquí.
- Los videos grandes de la SPA (`hero-background.mp4`, `flor_safari.mov`) están dentro de los límites de GitHub, pero si el proyecto crece conviene migrar a Git LFS.
