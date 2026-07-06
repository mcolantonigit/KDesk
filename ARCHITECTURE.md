# ARCHITECTURE.md

# KDesk

## Arquitectura del Proyecto

Versión: 1.0

---

# Patrón Arquitectónico

KDesk utilizará una arquitectura MVC.

```
Cliente
    ↓
React
    ↓
API REST
    ↓
Routes
    ↓
Controllers
    ↓
Services
    ↓
Models
    ↓
PostgreSQL
```

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

### Responsabilidades

| Carpeta | Responsabilidad |
|---------|-----------------|
| assets | Recursos estáticos |
| components | Componentes reutilizables |
| context | Context API |
| hooks | Custom Hooks |
| layouts | Layouts generales |
| pages | Pantallas del sistema |
| routes | Configuración de rutas |
| services | Comunicación con la API |
| styles | Archivos CSS |
| utils | Funciones auxiliares |

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

### Responsabilidades

| Carpeta | Responsabilidad |
|---------|-----------------|
| config | Configuración general |
| controllers | Procesamiento de peticiones |
| middleware | Middlewares |
| models | Acceso a PostgreSQL |
| routes | Definición de endpoints |
| services | Lógica de negocio |
| uploads | Archivos subidos |
| utils | Funciones auxiliares |

---

# Variables de Entorno

Toda información sensible deberá almacenarse mediante variables de entorno.

Ejemplos:

- Credenciales PostgreSQL
- Claves JWT
- API Keys
- Tokens

El proyecto deberá incluir:

- `.env`
- `.env.example`

El archivo `.env` nunca deberá subirse al repositorio.

---

# Principios Arquitectónicos

- Arquitectura MVC.
- Una única responsabilidad por archivo.
- Separación entre Frontend y Backend.
- Comunicación mediante API REST.
- Configuración sensible mediante variables de entorno.