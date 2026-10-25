# Componente: TableUi

`TableUi` es un componente de UI genérico, reutilizable y altamente configurable, diseñado para mostrar datos en formato de tabla. Proporciona funcionalidades clave listas para usar, como **ordenamiento**, **paginación**, y **renderizado personalizado** de celdas.

---

## Genéricos y Tipos

El componente utiliza un tipo genérico `<T>` para poder trabajar con cualquier estructura de datos.

-   **`<T extends { id: string | number }>`**: Impone una restricción de que cualquier objeto de datos pasado al componente **debe tener una propiedad `id`** que sea de tipo `string` o `number`. Esto es crucial para que React pueda identificar de manera única cada fila (`key={item.id}`).

---

## Props

-   **`columns`**:
    -   **Tipo**: `ColumnDefinitionTableUi<T>[]`
    -   **Descripción**: Un array de objetos que define la estructura y el comportamiento de cada columna de la tabla.

-   **`data`**:
    -   **Tipo**: `T[]`
    -   **Descripción**: Un array con los datos que se mostrarán en la tabla.

---

## Interfaz `ColumnDefinitionTableUi<T>`

Este es el objeto de configuración para cada columna y define su comportamiento:

-   **`header`**: `string`
    -   El texto que se mostrará en la cabecera de la columna.
-   **`accessor`**: `keyof T | 'actions'`
    -   La clave del objeto de datos (`T`) a la que esta columna accederá para obtener el valor a mostrar. Se puede usar un valor especial como `'actions'` para columnas que no mapean directamente a una propiedad de datos.
-   **`sortable?`**: `boolean` (opcional)
    -   Si es `true`, la columna será ordenable. Al hacer clic en la cabecera, se activará la lógica de ordenamiento.
-   **`render?`**: `(item: T) => React.ReactNode` (opcional)
    -   Una función que recibe el objeto completo de la fila (`item`) y devuelve un nodo de React. Esto permite un control total sobre el contenido de la celda, ideal para botones, insignias, imágenes o formato complejo.

---

## Características Principales

### 1. Ordenamiento (Sorting)
-   Las columnas marcadas como `sortable` son interactivas.
-   El primer clic ordena de forma ascendente, el segundo de forma descendente.
-   Un icono (`<SwapVertIcon>`, `<ArrowUpwardIcon>`, `<ArrowDownwardIcon>`) indica visualmente el estado de ordenamiento de la columna.

### 2. Paginación (Pagination)
-   El componente gestiona la división de los datos en páginas.
-   Incluye un selector para cambiar el número de filas por página (`5`, `10`, `25`, `50`).
-   La navegación de la paginación es inteligente: muestra los números de página relevantes y utiliza elipsis (`...`) para rangos grandes, evitando saturar la interfaz.

### 3. Renderizado Personalizado
-   Mediante la propiedad `render` en la definición de una columna, se puede inyectar cualquier componente JSX en una celda, lo que otorga una flexibilidad máxima para mostrar los datos.

### 4. Optimización
-   Utiliza el hook `useMemo` para calcular los datos ordenados (`sortedData`) y paginados (`paginatedData`). Esto asegura que los cálculos costosos de ordenamiento y filtrado solo se ejecuten cuando los datos o la configuración de orden/paginación cambien, mejorando el rendimiento.

---

## Ejemplo de Ejecución

A continuación se muestra cómo se podría utilizar `TableUi` en un componente padre para mostrar una lista de usuarios.

```tsx
import React from 'react';
import { TableUi, ColumnDefinitionTableUi } from './Table/TableUi';

// 1. Definimos el tipo de dato que vamos a mostrar
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'inactive' | 'pending';
}

// 2. Creamos datos de ejemplo (mock data)
const mockUsers: User[] = [
  { id: 1, name: 'Ana García', email: 'ana.g@example.com', age: 28, status: 'active' },
  { id: 2, name: 'Luis Pérez', email: 'luis.p@example.com', age: 34, status: 'inactive' },
  { id: 3, name: 'Carlos Sánchez', email: 'carlos.s@example.com', age: 22, status: 'active' },
  { id: 4, name: 'Sofía Martínez', email: 'sofia.m@example.com', age: 45, status: 'pending' },
  // ... añadir más usuarios para probar la paginación
  { id: 5, name: 'Juan Rodríguez', email: 'juan.r@example.com', age: 31, status: 'active' },
  { id: 6, name: 'Elena Gómez', email: 'elena.g@example.com', age: 29, status: 'inactive' },
  { id: 7, name: 'David Fernández', email: 'david.f@example.com', age: 38, status: 'active' },
  { id: 8, name: 'Laura Díaz', email: 'laura.d@example.com', age: 25, status: 'pending' },
  { id: 9, name: 'Miguel Torres', email: 'miguel.t@example.com', age: 41, status: 'active' },
  { id: 10, name: 'Isabel Romero', email: 'isabel.r@example.com', age: 33, status: 'inactive' },
  { id: 11, name: 'Javier Castillo', email: 'javier.c@example.com', age: 27, status: 'active' },
];


// Componente que usa la tabla
export const UsersListPage = () => {

  // 3. Definimos las columnas usando la interfaz ColumnDefinitionTableUi
  const userColumns: ColumnDefinitionTableUi<User>[] = [
    {
      header: 'Nombre Completo',
      accessor: 'name',
      sortable: true, // Esta columna se puede ordenar
    },
    {
      header: 'Correo Electrónico',
      accessor: 'email',
    },
    {
      header: 'Edad',
      accessor: 'age',
      sortable: true, // Esta también
    },
    {
      header: 'Estado',
      accessor: 'status',
      // 4. Usamos `render` para un formato personalizado (una insignia de color)
      render: (user) => {
        const statusStyles = {
          active: { backgroundColor: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '12px' },
          inactive: { backgroundColor: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '12px' },
          pending: { backgroundColor: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '12px' },
        };
        return <span style={statusStyles[user.status]}>{user.status.toUpperCase()}</span>;
      },
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      // 5. Usamos `render` para mostrar un botón o cualquier otro componente
      render: (user) => (
        <button 
          style={{ padding: '5px 10px', cursor: 'pointer' }}
          onClick={() => alert(`Editando usuario con ID: ${user.id}`)}
        >
          Editar
        </button>
      ),
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Lista de Usuarios</h1>
      <TableUi columns={userColumns} data={mockUsers} />
    </div>
  );
};
```