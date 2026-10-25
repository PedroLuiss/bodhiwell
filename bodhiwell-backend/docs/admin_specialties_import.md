# 🏥 Importación Masiva de Especialidades (Panel Admin)

Este documento describe cómo gestionar la carga masiva de especialidades desde el panel de administración de Bodhiwell.

## 🚀 Acceso
1. Inicia sesión en el **Panel de Administración**.
2. En el menú lateral, ve a **CONFIGURACIÓN > Especialidades**.
3. Haz clic en el botón **Carga Masiva** (icono de importar) situado en la esquina superior derecha.

## 📄 Estructura del Archivo (Excel / CSV)

El importador procesa el archivo basándose en el orden de las columnas. Asegúrate de que tu archivo siga esta estructura:

| Columna | Campo | Descripción |
|---|---|---|
| **A** | ID | Identificador numérico (informativo, el sistema lo ignora). |
| **B** | Nombre | **Obligatorio**. Nombre de la especialidad (ej: "Medicina general"). |
| **C** | Dimensión | Slug de la dimensión: `cuerpo`, `mente`, `energia` o `conciencia`. |
| **D** | Marco Legal | `acto_medico`, `profesion_regulada`, `practica_no_regulada` o `especialidad`. |
| **E** | Nivel Clínico | `alto`, `medio`, `bajo` o `acompanamiento`. |
| **F** | Estudio Base | Nombre de la profesión requerida (ej: "Medicina"). Si no existe, se crea automáticamente. |
| **G** | MSP Obligatorio | `si` o `no`. Indica si requiere registro en el Ministerio de Salud. |
| **H** | Profesión Principal | `si` o `no`. Indica si es una profesión base en sí misma. |
| **I** | Título (M) | Título público masculino (ej: "Médico general"). |
| **J** | Título (F) | Título público femenino (ej: "Médica general"). |
| **K** | Título (N) | Título público neutro. |
| **L** | Descripción | Descripción detallada de la especialidad. |

## ⚙️ Lógica de Actualización

El sistema utiliza el **Nombre** (normalizado internamente a `slug`) para identificar los registros:

- **Insensibilidad total**: El importador es **insensible a mayúsculas, minúsculas y acentos** para identificar si el registro ya existe. 
    - Ejemplo: "Nutrición", "Nutricion" y "nutricion" se tratarán como la misma especialidad y se **actualizará** la existente en lugar de crear un duplicado.
- **Si la especialidad NO existe**: Se crea un nuevo registro.
- **Si la especialidad YA existe**: Se actualizan todos sus campos con la información del archivo.
- **Sincronización de Dependencias**: El proceso crea automáticamente las **Dimensiones** y las **Profesiones Base** si no se encuentran en el sistema, asegurando la integridad de las relaciones.

## ⚠️ Recomendaciones
- **Evita cambios de nombre en el Excel**: Si cambias el nombre de una especialidad en el archivo (ej: de "Nutrición" a "Nutrición Integral"), el sistema la tratará como una **nueva especialidad** y tendrás un duplicado. Para renombrar especialidades, utiliza la edición manual en el panel de administración.
- **Formato de Enums**: El sistema es flexible con los términos de las columnas D y E (Marco Legal y Nivel). Puedes usar tanto los códigos técnicos como los nombres legibles.
