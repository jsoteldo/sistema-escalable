# Boilerplate Sistema de Gestión Altamente Escalable

Este proyecto contiene un boilerplate completo y desacoplado estructurado de la siguiente forma:

- **`/sistema-backend`**: API REST pura construida con NestJS, Mongoose (MongoDB) y Passport JWT.
- **`/sistema-frontend`**: SPA construida con React, Vite, TypeScript y Bootstrap 5 (Estética AdminLTE).

---

## 🛠️ Requisitos Previos

1. **Node.js** v18 o superior.
2. **MongoDB** corriendo localmente en `mongodb://localhost:27017` (o configurar variable de entorno `MONGO_URI`).

---

## 🚀 Cómo Levantar los Proyectos en Paralelo

### Opción 1: Levantarlos en terminales separadas (Recomendado)

#### 1. Backend (`/sistema-backend`)
1. Entra a la carpeta del backend:
   ```bash
   cd sistema-backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run start:dev
   ```
El backend estará disponible en `http://localhost:3000`.

#### 2. Frontend (`/sistema-frontend`)
1. Entra a la carpeta del frontend:
   ```bash
   cd sistema-frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
El frontend estará disponible en `http://localhost:5173`.

---

## 🔒 Estructura de Seguridad & Permisos
- El JWT se genera con la firma local en el Backend y contiene los claims del usuario, rol y la matriz de permisos (`permissions`).
- El Frontend decodifica este token y utiliza el Hook `usePermissions` junto al componente `<ProtectedComponent>` para ocultar/deshabilitar elementos según la matriz del JWT.
- El Backend valida estos permisos a través del `PermissionsGuard` interceptando endpoints etiquetados con el decorador `@RequirePermission('modulo', 'accion')`.
