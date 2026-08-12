# KDesk

Sistema interno de gestión de tickets (mesa de ayuda) desarrollado para el
Departamento de Sistemas de una empresa, con foco en resolver un problema
real de soporte interno: alta de incidentes, seguimiento, backups y
administración de usuarios/permisos.

Proyecto personal desarrollado con asistencia de IA (Claude Code), como
forma de aprender construyendo un producto completo de punta a punta.

## Funcionalidades

- **Tickets**: alta, seguimiento por estado/prioridad, comentarios,
  adjuntos, checklist de tareas técnicas, historial de cambios.
- **Usuarios y permisos**: registro con activación por mail, login,
  recuperación de contraseña, roles (usuario / técnico / administrador),
  alta/baja, blanqueo de contraseña.
- **Auditoría**: registro de eventos relevantes del sistema.
- **Backups**: generación y restauración de backups de la base de datos
  desde la propia aplicación.
- **Estadísticas**: tablero con métricas de tickets.

## Stack

- **Frontend**: React, React Router, CSS puro, Context API, Vite.
- **Backend**: Node.js, Express, SQL puro (sin ORM) con el driver `pg`.
- **Base de datos**: PostgreSQL.
- **Autenticación**: JWT + cookies httpOnly, bcrypt para contraseñas.

Ver [docs/STACK.md](docs/STACK.md) para el detalle completo, y
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para la arquitectura MVC del
proyecto.

## Cómo correrlo localmente

Requiere Node.js y PostgreSQL instalados.

```bash
# Base de datos
psql -U postgres -c "CREATE DATABASE kdesk;"
psql -U postgres -d kdesk -f database/schema.sql

# Backend
cd backend
cp .env.example .env   # completar con tus valores (ver comentarios en el archivo)
npm install
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

El backend levanta en `http://localhost:4000` y el frontend (Vite) en
`http://localhost:5173`. `ALLOWED_EMAIL_DOMAINS` en `.env` define qué
dominios de correo pueden registrarse; ajustar también el `CHECK` de la
tabla `usuarios` en `database/schema.sql` para que coincida.

## Alcance y decisiones de seguridad

KDesk se diseñó para correr en la red interna de una empresa (intranet),
detrás de su propio firewall y sin exposición directa a internet. Eso
condicionó a propósito algunas decisiones:

- **Sin rate limiting** en login/reset de contraseña: el universo de
  usuarios es acotado y conocido (empleados con correo corporativo), y
  el riesgo de fuerza bruta desde la propia red interna es bajo.
- **Sin `helmet`** ni headers de seguridad adicionales: el tráfico no
  pasa por navegadores fuera de la red de la empresa ni convive con
  contenido de terceros.

Si este proyecto (o uno derivado) se fuera a exponer a internet, estas
dos cosas dejan de ser opcionales y habría que sumarlas antes de
desplegar.

## Documentación

El proyecto se desarrolló siguiendo un flujo documentado en `docs/`:

- [PROJECT.md](docs/PROJECT.md) — contexto y objetivos del producto.
- [FUNCTIONAL_REQUIREMENTS.md](docs/FUNCTIONAL_REQUIREMENTS.md) — requerimientos funcionales.
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitectura y estructura de carpetas.
- [CODING_RULES.md](docs/CODING_RULES.md) — convenciones de código del proyecto.
- [ROADMAP.md](docs/ROADMAP.md) — checklist de implementación, historial de decisiones.
