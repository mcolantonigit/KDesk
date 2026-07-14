# ROADMAP.md

# KDesk

## Hoja de ruta de implementación

Este documento traduce el "Alcance de la primera versión" (PROJECT.md) y los
requerimientos funcionales (FUNCTIONAL_REQUIREMENTS.md) en un orden de
implementación concreto, con checkboxes para ir marcando el avance real.

No reemplaza a esos documentos: ante cualquier duda de comportamiento,
la referencia sigue siendo FUNCTIONAL_REQUIREMENTS.md.

La auditoría (RF-022) no es un paso final: se implementa en paralelo,
a medida que se van agregando las acciones que debe registrar. Por eso
aparece como tarea suelta dentro de cada etapa donde corresponde, en vez
de como una etapa propia al final.

---

# 1. Catálogos base

- [x] Conector (model/service/controller/routes) de `roles`
- [x] Conector de `sucursales`
- [x] Conector de `sectores`
- [x] Conector de `tipos_ticket`
- [x] Conector de `estados`
- [x] Conector de `prioridades`

---

# 2. Autenticación y registro (RF-001, RF-002)

- [x] Registro de usuarios: validación de dominio @kalop.com.ar, correo
      duplicado y hasheo de contraseña
- [x] Auditoría: registrar alta de usuario (registro)
- [x] Login con JWT en cookie httpOnly
- [x] Logout
- [x] Middleware de autenticación (`requiereAutenticacion`)
- [ ] Recuperación de contraseña (versión futura, no es parte del alcance
      de la v1 según PROJECT.md)
- [x] Auditoría: registrar login y logout

---

# 3. Perfil de usuario (RF-003)

- [x] Endpoint para ver el propio perfil (nombre, apellido, correo,
      sucursal, sector, fecha de registro)
- [x] Endpoint para cambiar la propia contraseña
- [x] Auditoría: registrar cambio de contraseña

---

# 4. Tickets (RF-004, RF-005, RF-006, RF-007, RF-008, RF-009, RF-018)

- [x] Conector base de `tickets` (crear, listar, obtener por id)
- [x] Numeración automática TK-000001 (ya resuelto por trigger en BD,
      falta exponerlo/usarlo desde el backend)
- [x] Armado automático del nombre descriptivo (Sector - Usuario - Título)
- [x] Completar automáticamente: usuario creador, sector, sucursal,
      estado inicial, responsable sin asignar
- [x] Asignación de responsable (solo un técnico principal)
- [x] Cambios de prioridad (sugerida por usuario, definitiva por técnico)
- [x] Cambios de estado
- [x] Auditoría: registrar creación, cambio de estado, cambio de
      prioridad y cambio de responsable

---

# 5. Comentarios, tareas técnicas e historial (RF-010, RF-011, RF-012)

- [x] Conector de `comentarios` (crear, listar, eliminar lógico; borra el
      autor o un técnico/administrador)
- [x] Conector de `tareas_tecnicas` (crear, listar, editar texto, marcar
      completada, eliminar; solo visibles/administrables por técnicos y
      administradores)
- [x] Frontend: checklist en el detalle de ticket (RF-014 "Gestionar
      tareas técnicas"), visible solo para roles técnico/administrador.
      Botón "Agregar checklist" que despliega el listado; cada item es
      un input de texto editable con checkbox (marca completado,
      tachando el texto) y una "X" para eliminarlo; botón "+" para
      sumar items y botón para eliminar el checklist completo
- [x] Conector de `historial_ticket` (registro cronológico de eventos)
- [x] Enganchar historial automáticamente a: creación, cambios de estado,
      cambios de prioridad, cambios de responsable, comentarios,
      eliminación de comentarios, tareas creadas/completadas
- [x] Enganchar historial a adjuntos agregados/eliminados (resuelto en
      la etapa 7, junto con el conector de `adjuntos`)
- [x] Auditoría (tabla `auditoria`): solo aplica a altas/modificaciones
      del ticket en sí (creación, cambio de estado/prioridad/responsable),
      ya cubierto en `tickets.service.js`. Comentarios y tareas técnicas
      son sub-entidades del ticket: quedan registrados en
      `historial_ticket`, no en la auditoría general del sistema.

---

# 6. Paneles (RF-013, RF-014, RF-015, RF-016, RF-017)

- [x] Pantallas de login y registro (frontend, consumen
      `POST /usuarios/login` y `POST /usuarios/register`, ya
      implementados en el backend)
- [x] Panel de usuario: solo sus propios tickets (menú "Mis tickets":
      nuevo ticket, tickets activos, tickets cerrados; tabla ordenable
      por columna; detalle con datos completos, adjuntos, comentarios
      con sus propios adjuntos e historial cronológico)
- [x] Endpoint `PATCH /tickets/:id/cerrar`: el usuario creador puede
      cerrar su propio ticket con un comentario de motivo obligatorio
      (decisión de producto: reemplaza a "Cancelar tickets cuando
      corresponda" de RF-013; el usuario solo puede llevar el ticket a
      "Cerrado", ningún otro cambio de estado)
- [x] Panel del Departamento de Sistemas: todos los tickets (botón
      "Dashboard" en el header, visible solo para roles técnico y
      administrador → submenú "Tablero")
- [x] Vista lista y vista tarjetas (selector "Vista" en la barra de
      herramientas del Tablero)
- [x] Ordenar por cualquier columna en la vista lista (mismo mecanismo
      que la tabla del panel de usuario)
- [x] Cierre de ticket desde el Tablero (por fila/tarjeta) y desde el
      detalle, con comentario de motivo obligatorio — reutiliza
      `PATCH /tickets/:id/cerrar`, ahora también habilitado para
      técnicos/administradores sobre cualquier ticket
- [x] Botón rápido "Nuevo ticket" en la barra de herramientas del
      Tablero (reutiliza la pantalla de creación existente)
- [~] Filtros combinables: implementados sucursal, sector, estado
      (default "activos", con opción "Todos" y por estado puntual),
      prioridad, técnico responsable (incluye "Sin asignar") y rango de
      fechas (desde/hasta, con selector de calendario nativo). Falta
      filtro por tipo de ticket y por usuario creador puntual (hoy solo
      se puede buscar por texto libre) si se piden más adelante
- [x] Búsquedas (número, usuario creador, título, contenido/descripción,
      responsable) — input de texto en la barra de herramientas del
      Tablero, combinable con los filtros de arriba
- [x] Ajustes de UX del Tablero: filtros ocultos por defecto (botón
      "Filtrar" los muestra), selector de vista como botones con ícono
      en vez de `<select>`, columnas de la tabla configurables (botón
      "Columnas"; oculta por defecto Última actualización y Fecha de
      cierre), y edición inline de prioridad/estado/responsable por
      fila (reutiliza `PATCH /tickets/:id/estado`, `/prioridad` y
      `/responsable`, ya existentes)
- [x] Navegación desde el detalle de ticket: botón "Atrás" y teclas
      Esc/Backspace (fuera de campos de texto) vuelven a la pantalla
      anterior (Tablero o Mis tickets, según de dónde se entró)

---

# 7. Adjuntos (RF-019)

- [x] Conector de `adjuntos` (tickets, comentarios, tareas técnicas):
      subir, listar, descargar y eliminar (autor o técnico/administrador)
- [x] Restricciones: máximo 500MB por archivo; tipos permitidos: imágenes
      (jpg, png, webp, gif), PDF, txt, Word y Excel
- [x] Historial: registrar adjuntos agregados o eliminados en
      `historial_ticket` (sub-entidad del ticket, no va a la auditoría
      general del sistema, mismo criterio que comentarios y tareas)

---

# 8. Panel de administración (RF-024) y estadísticas (RF-020)

- [x] Menú "Administrar" en el header: visible para roles técnico y
      administrador; "Usuarios y permisos" y "Parámetros" restringidos
      a rol administrador únicamente (nuevo guard `RutaAdministrador` +
      middleware `requiereRolAdministrador`)
- [x] Administrar usuarios: página "Usuarios y permisos" con tabla
      (búsqueda, columnas configurables), cambio de rol inline
      (usuario/técnico, `PATCH /usuarios/:id/rol`) y blanqueo de
      contraseña por modal (`PUT /usuarios/:id/password`, sin pedir la
      anterior). No permite asignar/quitar el rol administrador desde
      acá (solo usuario ↔ técnico)
- [x] Administrar sucursales, sectores, tipos de ticket, prioridades y
      estados desde el panel ("Parámetros"): alta y edición de nombre,
      y activar/desactivar en vez de borrar físicamente (evita romper
      tickets ya cargados con ese valor)
- [~] Administrar permisos por rol: cubierto el cambio usuario ↔
      técnico; falta un sistema de permisos más granular si se necesita
      a futuro (por ahora técnico y administrador comparten el mismo
      nivel de acceso operativo, según lo definido en la etapa 9)
- [x] Estadísticas: tickets por sucursal, sector, técnico, prioridad y
      tipo (gráficos de barras horizontales), tiempo de resolución
      promedio general (hero figure) y desglosado por técnico. Filtro
      de rango de fechas (desde/hasta) aplicado a todo. Todo calculado
      en el frontend a partir de `GET /tickets` + catálogos, sin
      endpoints nuevos de agregación. Paleta categórica validada contra
      el fondo oscuro de KDesk con el validador de la skill de dataviz
- [x] Auditoría: `GET /auditoria` + pantalla que lista todos los
      eventos ya registrados por el sistema (login, registro, cambios
      de ticket, cambios de rol, blanqueo de contraseña, etc.)
- [x] Revisado a mano en el navegador: Tablero, checklist, filtros de
      fecha y panel de Administración completo (usuarios y permisos,
      parámetros, auditoría)

---

# 9. Roles y permisos (RF-021)

- [x] Middleware de autorización por rol: `requiereRolTecnico` (técnico
      o administrador, tratados como "personal del sistema" con el
      mismo nivel de acceso) reutilizando `req.usuario` que arma el
      middleware de autenticación
- [x] Rutas protegidas según rol: cambios de estado/prioridad/responsable
      y tareas técnicas de tickets; listado general de usuarios
      (`GET /usuarios`, `GET /usuarios/:id`) restringido a personal del
      sistema, no a usuarios convencionales
- [ ] Revisar si en el futuro hace falta distinguir permisos entre
      técnico y administrador (por ahora se tratan igual, según lo
      definido: "los técnicos son administradores del sistema")
