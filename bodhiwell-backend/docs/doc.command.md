## 👤 Crear usuarios desde consola

Puedes crear usuarios privilegiados (admin/owner) usando el comando personalizado:

```sh
php bin/console app:user:create EMAIL [--username=USERNAME] [--first=NOMBRE] [--last=APELLIDO] [--password=PASSWORD] [--type=patient|professional] [--admin] [--owner] [--inactive]
```

### Ejemplo básico

```sh
php bin/console app:user:create user@gmail.com --username=admin --first=userfirst --last=userlast --password='MiPassw0rd!' --admin
```

### Opciones disponibles

- `EMAIL` (obligatorio): Email del usuario.
- `--username`: Nombre de usuario (si no se indica, se usa el email).
- `--first`: Nombre (por defecto: User).
- `--last`: Apellido (por defecto: Demo).
- `--password`: Contraseña (mínimo 8 caracteres). Si no se indica y la consola es interactiva, se solicitará.
- `--type`: Tipo de cuenta (`patient` o `professional`). Opcional.
- `--admin`: Asigna el rol `ROLE_ADMIN`.
- `--owner`: Asigna el rol `ROLE_OWNER`.
- `--role`: Puedes usarlo varias veces para asignar roles específicos (`ROLE_ADMIN`, `ROLE_OWNER`).
- `--inactive`: Crea el usuario como inactivo.

### Notas

- Debes asignar al menos un rol (`--admin` y/o `--owner` o `--role`).
- El comando valida que el email y el username no estén repetidos.
- Si no usas `--password` en modo no interactivo, el comando fallará.
- El campo `type_account` es opcional y puede ser actualizado luego por el usuario.

---

## 🗑️ Resetear la base de datos (borrar todos los registros)

Borra **todos los registros** de todas las tablas del schema actual, dejando intacta únicamente la tabla `doctrine_migration_versions` (control interno de Doctrine).

> [!CAUTION]
> Este comando **no puede ejecutarse en producción** (`APP_ENV=prod` o `APP_ENV=production`). Si intentas hacerlo, el comando se cancela automáticamente con error.

### Uso

```bash
# Modo interactivo (pide confirmación manual)
php bin/console app:db:reset

# Sin confirmación (para scripts / pipelines)
echo "yes" | php bin/console app:db:reset
```

### Comportamiento por entorno

| Entorno | `APP_ENV` | Permitido |
|---|---|---|
| Local | `dev` | ✅ Sí |
| Desarrollo / Staging | `dev`, `staging` | ✅ Sí |
| Producción | `prod`, `production` | ❌ Bloqueado |

### Qué hace internamente

1. Verifica que `APP_ENV` no sea `prod` / `production`. Si lo es, sale con error.
2. Muestra un aviso y solicita confirmación (`yes/no`).
3. Consulta **dinámicamente** `information_schema` para obtener la lista completa de tablas.
4. Ejecuta `SET FOREIGN_KEY_CHECKS=0` para evitar errores de foreign key.
5. Hace `TRUNCATE` de cada tabla.
6. Restaura `SET FOREIGN_KEY_CHECKS=1`.
7. Muestra el número de tablas vaciadas.

> [!NOTE]
> Como las tablas se obtienen dinámicamente, el comando **no necesita actualizarse** cuando se añadan o renombren tablas en el futuro.

### Tabla que siempre se conserva

| Tabla | Razón |
|---|---|
| `doctrine_migration_versions` | Control interno de migraciones. Borrarlo rompería el sistema. |

### Flujo completo para empezar pruebas desde cero

```bash
# 1. Borrar todos los registros
echo "yes" | php bin/console app:db:reset

# 2. Crear usuario admin para el backoffice
php bin/console app:user:create admin@bodhiwell.com \
  --admin \
  --first=Admin \
  --last=User \
  --password=MiContraseña123

# 3. (Opcional) Cargar fixtures de datos base
php bin/console doctrine:fixtures:load --no-interaction
```

### Uso en servidor de desarrollo remoto (SSH)

```bash
# Asegúrate de que APP_ENV=dev en el .env del servidor
echo "yes" | php bin/console app:db:reset
```

---