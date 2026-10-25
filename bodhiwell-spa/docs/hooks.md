# Custom Hook: useGetReservations

El hook `useGetReservations` encapsula toda la lógica necesaria para obtener una lista de reservaciones desde una fuente de datos externa. Se encarga de gestionar de forma autónoma los tres estados fundamentales de una petición de datos: **carga (`loading`)**, **éxito (`data`)** y **error (`error`)**.

---

## Propósito Principal

El objetivo de este hook es abstraer la complejidad de las llamadas asíncronas, el manejo de estados y la gestión de errores, proporcionando una interfaz simple y declarativa para los componentes que necesiten consumir datos de reservaciones.

---

## Dependencias

-   **`reservationsService`**: Este hook no realiza la llamada a la API directamente. Delega esa responsabilidad a `reservationsService`, un módulo de servicio que contiene la lógica específica para comunicarse con el backend (ej. usando `fetch` o `axios`). Esta separación de responsabilidades hace que el hook sea más limpio y mantenible.

---

## Lógica de Funcionamiento y Ciclo de Vida

1.  **Inicialización de Estados**:
    -   `data`: Se inicializa como un array vacío (`[]`).
    -   `loading`: Se inicializa en `true`. Esto asegura que cualquier componente que use el hook muestre inmediatamente un estado de carga al montarse.
    -   `error`: Se inicializa como `null`.

2.  **Efecto de Montaje (`useEffect`)**:
    -   El hook utiliza un `useEffect` con un array de dependencias vacío (`[]`). Esto garantiza que la lógica de obtención de datos se ejecute **una sola vez**, justo después de que el componente que lo usa se monte por primera vez.
    -   Dentro del efecto, se define una función asíncrona `fetchReservations`.

3.  **Proceso de Petición (`try/catch/finally`)**:
    -   **`try`**: Se intenta obtener los datos llamando a `reservationsService.getReservations()`. Si la promesa se resuelve con éxito, los datos recibidos se almacenan en el estado `data` y el estado `error` se restablece a `null`.
    -   **`catch`**: Si la promesa es rechazada (ocurre un error en la red o en el servidor), el error es capturado. Se actualiza el estado `error` con un mensaje descriptivo.
    -   **`finally`**: Este bloque se ejecuta siempre, tanto si la petición tuvo éxito como si falló. Su única responsabilidad es establecer el estado `loading` a `false`, indicando que la operación ha finalizado.

---

## Valores de Retorno (`UseReservationsReturn`)

El hook devuelve un objeto con tres propiedades que representan el estado actual de la petición:

-   **`data`**:
    -   **Tipo**: `Reservation[]`
    -   **Descripción**: Un array que contendrá los datos de las reservaciones una vez que la petición se complete con éxito. Mientras tanto, será un array vacío.

-   **`loading`**:
    -   **Tipo**: `boolean`
    -   **Descripción**: Es `true` mientras la petición de datos está en curso. Pasa a ser `false` cuando la petición termina (ya sea con éxito o con error).

-   **`error`**:
    -   **Tipo**: `string | null`
    -   **Descripción**: Es `null` si no ha ocurrido ningún error. Si la petición falla, contendrá un `string` con el mensaje de error.

---

## Ejemplo de Uso

Así es como un componente consumiría este hook para renderizar contenido de forma condicional.

```tsx
import React from 'react';
import { useGetReservations } from './hooks/useGetReservations';
import LoadingSpinner from './components/ui/LoadingSpinner';

export const MyReservationsComponent = () => {
  // 1. Consumir el hook. La lógica de fetching se ejecuta automáticamente.
  const { data: reservations, loading, error } = useGetReservations();

  // 2. Renderizado condicional basado en los estados devueltos por el hook.
  if (loading) {
    return <LoadingSpinner text="Cargando tus reservaciones..." />;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }
  
  if (reservations.length === 0) {
      return <p>No tienes ninguna reservación.</p>
  }

  // 3. Renderizado del estado de éxito.
  return (
    <div>
      <h1>Mis Reservaciones</h1>
      <ul>
        {reservations.map(reservation => (
          <li key={reservation.id}>
            {reservation.date} - {reservation.reason}
          </li>
        ))}
      </ul>
    </div>
  );
};
```