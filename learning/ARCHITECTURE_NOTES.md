# ARCHITECTURE.md

# KDesk

## Arquitectura del Proyecto

Versión: 1.0

---

# Patrón Arquitectónico

KDesk utilizará el patrón MVC (Model - View - Controller).

Toda nueva funcionalidad deberá respetar esta arquitectura.

No se permitirá modificar la estructura general sin autorización.

---

# Estructura General

```
KDesk/

├── frontend/
└── backend/
```

---

# Frontend

```
frontend/

src/

├── assets/
├── components/
├── context/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```

## Descripción

### assets/

Imágenes, íconos y recursos estáticos.

### components/

Componentes reutilizables.

No deben contener lógica de negocio.

### context/

Context API.

Utilizar únicamente cuando sea realmente necesario.

### hooks/

Custom Hooks reutilizables.

### layouts/

Estructuras generales de las pantallas.

Ejemplos:

- Layout público
- Layout autenticado

### pages/

Pantallas completas del sistema.

Una página puede utilizar múltiples componentes.

### routes/

Configuración de React Router.

### services/

Toda comunicación con la API.

Los componentes nunca deberán realizar llamadas `fetch()` directamente.

### styles/

Archivos CSS.

### utils/

Funciones auxiliares reutilizables.

---

# Backend

```
backend/

├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── uploads/
├── utils/
├── .env
├── .env.example
├── app.js
└── server.js
```

## Descripción

### config/

Configuraciones generales del sistema.

Ejemplos:

- Conexión a PostgreSQL
- Variables de entorno
- Configuración general

### routes/

Definición de endpoints.

No contienen lógica de negocio.

Su única responsabilidad es recibir la petición y delegarla al Controller correspondiente.

### controllers/

Procesan la petición.

Validan datos.

Invocan los Services.

Devuelven la respuesta al cliente.

### services/

Contienen toda la lógica de negocio.

Pueden reutilizarse desde distintos Controllers.

### models/

Acceso a la base de datos mediante consultas SQL.

No deberán contener lógica de negocio.

### middleware/

Middlewares de Express.

Ejemplos:

- Autenticación
- Validaciones
- Manejo de errores

### uploads/

Archivos subidos por los usuarios.

### utils/

Funciones auxiliares reutilizables.

---

# Variables de Entorno

Toda información sensible deberá almacenarse exclusivamente mediante variables de entorno.

Ejemplos:

- Credenciales de PostgreSQL
- Claves JWT
- API Keys
- Tokens
- Configuración SMTP
- Secretos de autenticación

Nunca deberán escribirse credenciales directamente en el código fuente.

El proyecto incluirá un archivo `.env.example` con todas las variables necesarias para ejecutar la aplicación, sin contener información sensible.

El archivo `.env` deberá incluirse en `.gitignore` y nunca deberá subirse al repositorio.

---

# Flujo de una Petición

Toda petición deberá seguir el siguiente recorrido:

```
Cliente

↓

React

↓

Service

↓

API REST

↓

Route

↓

Controller

↓

Service

↓

Model

↓

PostgreSQL

↓

Controller

↓

Respuesta JSON

↓

React
```

---

# Principios

- Cada archivo deberá tener una única responsabilidad.
- Los componentes React deberán limitarse a mostrar información y gestionar la interacción con el usuario.
- La lógica de negocio pertenecerá exclusivamente a la capa Services.
- El acceso a la base de datos se realizará únicamente desde Models.
- Las consultas SQL no deberán escribirse en Controllers.
- Los Controllers no deberán contener lógica de negocio compleja.
- Toda comunicación entre Frontend y Backend se realizará mediante una API REST.

---

# Reglas para Claude

- Respetar estrictamente la estructura definida en este documento.
- No crear nuevas carpetas sin autorización.
- No mover archivos entre módulos sin autorización.
- No escribir consultas SQL fuera de Models.
- No realizar llamadas `fetch()` fuera de `frontend/src/services`.
- No escribir lógica de negocio en Routes.
- No escribir lógica de negocio compleja en Controllers.
- Nunca escribir claves privadas, contraseñas o tokens directamente en el código.
- Toda información sensible deberá obtenerse mediante variables de entorno utilizando `dotenv`.
- Si una funcionalidad requiere modificar la arquitectura, detener la implementación y solicitar autorización antes de continuar.