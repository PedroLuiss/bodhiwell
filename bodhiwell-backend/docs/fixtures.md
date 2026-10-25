# Guía de Configuración Local y Debugging de Fixtures

Esta guía detalla los pasos para recrear tu base de datos localmente, cargar los nuevos seeders.

## Pregunta Frecuente: ¿Debo limpiar la base de datos actual antes?
** No es necesario limpiar las filas manualmente.**
Si tu objetivo es "empezar de cero", la forma más limpia es destruir la base de datos completa y volverla a crear. Esto elimina cualquier tabla, configuración o dato corrupto arrastrado.

## 1. Reset Total: El método "Nuke and Pave"
Este proceso **ELIMINARÁ** todos los datos de tu base de datos local actual configurada en `.env`.

```bash
# 1. Eliminar la base de datos completa (Destruye el archivo o esquema)
php bin/console doctrine:database:drop --force

# 2. Crear una base de datos nueva y vacía
php bin/console doctrine:database:create

# 3. Crear las tablas (Schema)
php bin/console doctrine:schema:create
```

*Nota: Si prefieres crear una SEGUNDA base de datos para pruebas sin borrar la original, cambia el nombre de la base de datos en tu archivo `.env` (variable `DATABASE_URL`) antes de ejecutar estos pasos.*

## 2. Cargar los Fixtures (Seeders)
Una vez que tienes la base de datos vacía (paso 1), llénala con los datos de prueba:

```bash
# Carga los fixtures. 
# El sistema purgará (limpiará) las tablas automáticamente antes de insertar, 
# pero como acabamos de crear la DB, ya está vacía.
php bin/console doctrine:fixtures:load -n
```

### Verificación Rápida
Verifica que los datos se crearon correctamente:

```bash
php bin/console dbal:run-sql "SELECT count(*) FROM dimension UNION ALL SELECT count(*) FROM specialty UNION ALL SELECT count(*) FROM profession"
```
Resultados esperados:
- 4 Dimensiones
- 16 Especialidades
- 19 Profesiones

