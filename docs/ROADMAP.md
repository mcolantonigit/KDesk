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
- [x] Conector de `tareas_tecnicas` (crear, listar, marcar completada;
      solo visibles/administrables por técnicos y administradores)
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
- [ ] Panel de usuario: solo sus propios tickets
- [ ] Panel del Departamento de Sistemas: todos los tickets
- [ ] Vista lista y vista tarjetas
- [ ] Filtros combinables (estado, prioridad, tipo, técnico, usuario,
      sector, sucursal, fecha)
- [ ] Búsquedas (número, usuario, título, contenido, responsable)

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

- [ ] Administrar usuarios y técnicos (alta, edición, baja)
- [ ] Blanquear credenciales (sin exponer la contraseña anterior)
- [ ] Administrar sucursales, tipos de ticket, prioridades y estados
      desde el panel (ya existen los conectores base, falta el CRUD
      completo de alta/edición/baja)
- [ ] Administrar permisos por rol
- [ ] Estadísticas: por sucursal, sector, técnico, tiempos de
      resolución, prioridades, tipos de ticket
- [ ] Auditoría: registrar todas las acciones realizadas desde este panel

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
