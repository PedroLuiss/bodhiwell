# Componente: ReservationsPage

El componente `ReservationsPage` es una página principal diseñada para mostrar una lista de reservaciones. Se encarga de gestionar el ciclo de vida de la obtención de datos, mostrando estados de carga, error, o la tabla de reservaciones una vez que los datos están disponibles.

---

## Dependencias y Componentes Utilizados

-   **`ReservationsTable`**: Componente hijo que se utiliza para renderizar la tabla con los datos de las reservaciones.
-   **`Loading`**: Componente de UI para mostrar un indicador de carga a pantalla completa.
-   **`useGetReservations`**: Hook personalizado encargado de la lógica de obtención de las reservaciones desde una fuente de datos (ej. API).
-   **`ReservationsPage.module.scss`**: Módulo de estilos CSS específico para este componente.

---

## Lógica Interna

El componente utiliza el hook `useGetReservations` para obtener el estado de la petición de datos. Este hook devuelve tres valores:

-   **`data` (renombrado a `reservations`)**: Un array con los objetos de las reservaciones.
-   **`loading`**: Un booleano que es `true` mientras los datos se están cargando.
-   **`error`**: Contiene un mensaje de error si la petición falla.

La función `renderContent` se encarga de la renderización condicional basada en estos valores.

---

## Renderización Condicional

La lógica de visualización dentro de `renderContent` es la siguiente:

1.  **Si `loading` es `true`**: Muestra el componente `<Loading>` a pantalla completa con el texto "Cargando reservas...".
2.  **Si `error` tiene un valor**: Muestra un párrafo con el mensaje de error en color rojo.
3.  **Si `reservations` es un array vacío** (y no hay error ni está cargando): Muestra el mensaje "No hay reservas para mostrar.".
4.  **En cualquier otro caso** (la petición fue exitosa y hay datos): Renderiza el componente `<ReservationsTable>` y le pasa los datos de las reservaciones a través de la prop `data`.

---

## Estructura JSX

El componente retorna un `div` principal que actúa como contenedor de la página, centrado y con una disposición de columna flexible. Dentro de este `div`, se invoca a `renderContent()` para mostrar el contenido apropiado según el estado actual de la obtención de datos.