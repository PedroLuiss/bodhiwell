# 🏥 Frontend - Plataforma Médica  

Este repositorio contiene el frontend de la Plataforma Médica Digital, desarrollado con React y TypeScript para garantizar una arquitectura robusta, escalable y mantenible.

🚀 Tecnologías Implementadas
✅ React + TypeScript → Estructura tipada para mayor seguridad y flexibilidad. 
✅ Styled Components / BEM → Organización clara y reutilizable de estilos. 
✅ React Router → Gestión eficiente de navegación y rutas. 
✅ Context API → Manejo de estado optimizado. 

## 📂 Estructura del Proyecto

- `/src/components` → Componentes reutilizables  
- `/src/pages` → Páginas de la aplicación  
- `/src/assets` → Íconos, imágenes y estilos  
- `/src/utils` → Funciones auxiliares  
- `/src/services` → Llamadas a APIs  

## 🔧 Tecnologías Utilizadas

- **Create App React**  
- **React Router** (manejo de rutas)  
- **Styled Components / Bootstrap CSS**    
- **Context API**  

## 🛠 Instalación y Ejecución

1️⃣ **Clonar el repositorio:**  
```sh
git clone <URL_DEL_REPO>
```

2️⃣ **Instalar dependencias:**  
```sh
npm install
```

3️⃣ **Ejecutar el proyecto:**  
```sh
npm run dev
```
Abre [http://localhost:5173](http://localhost:5173) para visualizarlo en tu navegador.

## 🔬 Pruebas

Ejecuta los test con el siguiente comando:  
```sh
npm test
```

## 🚀 Despliegue

Para generar una versión optimizada para producción:  
```sh
npm run build
```
Esto creará una carpeta `/dist` lista para ser desplegada.

## 📝 Contribución

Si deseas contribuir, sigue estos pasos:

1. Haz un fork del repositorio.  
2. Crea una nueva rama (`git checkout -b feature-nueva`).  
3. Realiza los cambios y commitea (`git commit -m "Descripción del cambio"`).  
4. Envía un **pull request** para revisión.  

---

**Ejecutar proyecto con PM2:**  

pm2 start npm --name  "spa-dev-bodhiwell" -- run start

# Login - Documentación rápida

## Estructura y flujo

- **Hook `useAuth`**: Encapsula el manejo de formulario, validación, loading y errores. Expone funciones y estados para el login.
- **Servicio `authService.js`**: Función `login(credentials)` que realiza la petición POST a `/api/auth/jwt-login` y retorna `{ token, user }` o error.
- **Contexto `AuthContext`**: Provee el estado global de autenticación (`token`, `user`, `isAuthenticated`, `login`, `logout`).
- **Componente `Login.tsx`**: Usa el hook `useAuth` para manejar el formulario y, al autenticarse, guarda el usuario y token en el contexto global.

## Props y decisiones

- El formulario es controlado por el hook (`form`, `handleChange`).
- Los errores y el estado de carga (`errors`, `loading`) se muestran en la UI.
- Al login exitoso, se llama a `AuthContext.login(token, user)` para persistir la sesión.
- El token y el usuario se almacenan en localStorage para persistencia.

## Servicios y hooks utilizados

- `useAuth`: Hook personalizado para lógica de login.
- `authService.login`: Servicio para autenticación vía API.
- `useAuthContext`: Acceso al contexto global de autenticación.

---