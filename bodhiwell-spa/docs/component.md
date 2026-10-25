# Componente: ReservationsTable

El componente `ReservationsTable` es un componente especializado que renderiza una tabla de reservaciones. Su principal característica es que adapta dinámicamente sus columnas según el tipo de usuario autenticado (paciente o profesional), proporcionando una vista contextual de los datos.

Ruta: src\components\ReservationsTable\ReservationsTable.tsx

---

## Props

-   **`data`**:
    -   **Tipo**: `Reservation[]`
    -   **Descripción**: Un array de objetos `Reservation` que contiene los datos a mostrar en la tabla.

---

## Dependencias y Componentes Utilizados

-   **`TableUi`**: Componente de UI genérico y reutilizable que se encarga de renderizar la estructura de la tabla (filas, columnas, cabeceras, etc.). `ReservationsTable` actúa como una capa de configuración para este componente.
-   **`useAuthContext`**: Hook para acceder al contexto de autenticación y obtener los datos del usuario logueado, lo cual es clave para la lógica condicional del componente.
-   **`useMemo`**: Hook de React utilizado para memorizar la definición de las columnas, optimizando el rendimiento al evitar que se recalculen en cada renderizado si el usuario no ha cambiado.
-   **`formatTime`**: Función de utilidad para formatear las horas de inicio y fin de cada turno de reserva.

---

## Lógica Interna y Comportamiento Dinámico

La lógica principal reside en la definición de las columnas de la tabla, que se calcula dentro de un hook `useMemo`.

### Columnas Dinámicas

Las columnas mostradas son dinámicas y dependen del tipo de cuenta (`type_account`) del usuario obtenido a través del hook `useAuthContext`.

-   **Si el usuario es de tipo `'patient'`**: Se añade una columna `"Profesional"` (`professionalName`) al principio de la tabla para que el paciente pueda ver qué profesional le atenderá.
-   **Si el usuario no es un paciente** (ej. un profesional): Se añade una columna `"Paciente"` (`patientName`) al principio de la tabla, permitiendo al profesional ver qué paciente ha realizado la reserva.

### Columnas Base

Además de la columna condicional, existen columnas base que siempre se muestran:

1.  **Fecha y Hora (`dateTimeColumn`)**:
    -   Esta columna tiene un renderizado personalizado (`render`).
    -   Muestra la fecha en negrita (`item.date`).
    -   Debajo, mapea los `slots` (turnos) de la reserva para mostrarlos como insignias de tiempo (`time-slot-badge`), formateando la hora de inicio y fin con la utilidad `formatTime`.

2.  **Motivo de consulta (`reason`)**: Muestra el motivo de la reserva.

3.  **Acción (`actions`)**:
    -   Renderiza un botón "Ver Detalle".
    -   Actualmente, su funcionalidad `onClick` es un `console.log` del ID de la reserva, sirviendo como placeholder para una futura implementación de navegación o modal de detalle.

---

## Estructura JSX

El componente retorna un `div` que envuelve al componente genérico `<TableUi />`. A este último se le pasan dos props fundamentales:

-   **`columns`**: El array de definiciones de columnas calculado dinámicamente.
-   **`data`**: El array de reservaciones recibido a través de las props del componente.