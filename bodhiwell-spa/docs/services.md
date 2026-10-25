# Documentación del Servicio `bookingService`

Este documento detalla el funcionamiento del `bookingService`, un módulo encargado de gestionar todas las operaciones relacionadas con las reservas (bookings) en la aplicación. Este servicio actúa como una capa de abstracción para comunicarse con la API del backend, manejando las peticiones HTTP (GET, POST, PATCH, DELETE) y la gestión de datos.

## Dependencias

-   **`axiosInstance`**: Una instancia preconfigurada de `axios` que probablemente incluye la URL base de la API y las cabeceras de autenticación necesarias para las peticiones.
-   **Interfaces TypeScript (`IBooking...`)**: Tipos que definen la estructura de los datos enviados y recibidos del servidor, garantizando la seguridad de tipos en todo el servicio.

## Métodos del Servicio

A continuación, se describen todos los métodos exportados por `bookingService`.

### `getBookings()`

Obtiene un listado de todas las reservas asociadas al usuario autenticado (ya sea paciente o profesional).

-   **Parámetros**: Ninguno.
-   **Retorno**: `Promise<IBookingSummary[]>` - Una promesa que se resuelve con un array de objetos, donde cada objeto es un resumen de una reserva.
-   **Método HTTP**: `GET`
-   **Endpoint**: `/api/bookings`

#### Ejemplo de uso

### createBooking()
Crea una nueva reserva en el sistema. Esta función construye un objeto FormData para poder enviar tanto datos de texto como archivos (en este caso, una imagen del paciente).

**Parámetros:**
- `payload` (IBookingCrate): Un objeto que contiene toda la información necesaria para crear la reserva, incluyendo datos del profesional, fecha, información de contacto y opcionalmente notas, tipo e imagen.

**Retorno:** Promise<IBookingResponse> - Una promesa que se resuelve con la respuesta del servidor tras la creación, que puede incluir el ID de la nueva reserva.

**Método HTTP:** POST  
**Endpoint:** /api/bookings

**Ejemplo de uso:**

```ts
import { bookingService } from './services/bookingService';
import { IBookingCrate } from '../types/Booking/booking';

const handleCreateBooking = async (bookingData: IBookingCrate, photoFile: File) => {
    const payload = {
        ...bookingData,
        photo: photoFile, // Asumiendo que 'photoFile' es un objeto File de un input
    };

    try {
        const response = await bookingService.createBooking(payload);
        console.log('Reserva creada con éxito:', response);
        alert('Tu reserva ha sido creada.');
    } catch (error) {
        console.error('Error al crear la reserva:', error);
        alert('Hubo un problema al crear tu reserva.');
    }
};
```

## `getBookingById()`
Obtiene la información detallada de una reserva específica a través de su ID.

*   **Parámetros:** `id (string)` - El identificador único de la reserva que se desea consultar.
*   **Retorno:** `Promise<IBookingDetail>` - Una promesa que se resuelve con un objeto que contiene todos los detalles de la reserva.
*   **Método HTTP:** `GET`
*   **Endpoint:** `/api/bookings/{id}`

### Ejemplo de uso
```ts
import { bookingService } from './services/bookingService';

const fetchBookingDetails = async (bookingId: string) => {
    try {
        const bookingDetail = await bookingService.getBookingById(bookingId);
        console.log('Detalles de la reserva:', bookingDetail);
        // Actualizar el estado con los detalles para mostrarlos en la UI
    } catch (error) {
        console.error(`Error al obtener la reserva ${bookingId}:`, error);
    }
};
```

## `updateBooking()`
Actualiza uno o más campos de una reserva existente. Utiliza el método PATCH, lo que significa que solo se envían los campos que se desean modificar.

*   **Parámetros:**
    *   `id (string)`: El identificador de la reserva a actualizar.
    *   `update (IBookingUpdate)`: Un objeto con los campos y los nuevos valores a actualizar.
*   **Retorno:** `Promise<IBookingDetail>` - Una promesa que se resuelve con los detalles completos de la reserva ya actualizada.
*   **Método HTTP:** `PATCH`
*   **Endpoint:** `/api/bookings/{id}`

### Ejemplo de uso
```ts
import { bookingService } from './services/bookingService';
import { IBookingUpdate } from '../types/Booking/booking';

const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    const updateData: IBookingUpdate = {
        status: newStatus, // por ejemplo, 'confirmed' o 'completed'
    };

    try {
        const updatedBooking = await bookingService.updateBooking(bookingId, updateData);
        console.log('Reserva actualizada:', updatedBooking);
    } catch (error) {
        console.error('Error al actualizar la reserva:', error);
    }
};
```

## `cancelBooking()`
Cancela una reserva existente, eliminándola o marcándola como cancelada en el sistema.

*   **Parámetros:** `id (string)` - El identificador de la reserva a cancelar.
*   **Retorno:** `Promise<ICancelBookingResponse>` - Una promesa que se resuelve con un mensaje de confirmación de la cancelación.
*   **Método HTTP:** `DELETE`
*   **Endpoint:** `/bookings/{id}` (Nota: este endpoint parece no tener el prefijo /api como los demás, lo cual podría ser intencional o un error tipográfico en el código original).

### Ejemplo de uso
```ts
import { bookingService } from './services/bookingService';

const handleCancelBooking = async (bookingId: string) => {
    // Es buena práctica pedir confirmación al usuario antes de una acción destructiva
    if (window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
        try {
            const response = await bookingService.cancelBooking(bookingId);
            console.log('Respuesta de cancelación:', response.message);
            alert('La reserva ha sido cancelada.');
            // Aquí se podría actualizar la UI para eliminar la reserva de la lista
        } catch (error) {
            console.error('Error al cancelar la reserva:', error);
            alert('No se pudo cancelar la reserva.');
        }
    }
};
```