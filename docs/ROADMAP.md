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

- [ ] Endpoint para ver el propio perfil (nombre, apellido, correo,
      sucursal, sector, fecha de registro)
- [ ] Endpoint para cambiar la propia contraseña
- [ ] Auditoría: registrar cambio de contraseña

---

# 4. Tickets (RF-004, RF-005, RF-006, RF-007, RF-008, RF-009, RF-018)

- [ ] Conector base de `tickets` (crear, listar, obtener por id)
- [ ] Numeración automática TK-000001 (ya resuelto por trigger en BD,
      falta exponerlo/usarlo desde el backend)
- [ ] Armado automático del nombre descriptivo (Sector - Usuario - Título)
- [ ] Completar automáticamente: usuario creador, sector, sucursal,
      estado inicial, responsable sin asignar
- [ ] Asignación de responsable (solo un técnico principal)
- [ ] Cambios de prioridad (sugerida por usuario, definitiva por técnico)
- [ ] Cambios de estado
- [ ] Auditoría: registrar creación, cambio de estado, cambio de
      prioridad y cambio de responsable

---

# 5. Comentarios, tareas técnicas e historial (RF-010, RF-011, RF-012)

- [ ] Conector de `comentarios` (crear, listar, eliminar lógico)
- [ ] Conector de `tareas_tecnicas` (crear, listar, marcar completada)
- [ ] Conector de `historial_ticket` (registro cronológico de eventos)
- [ ] Enganchar historial automáticamente a: creación, cambios de estado,
      cambios de prioridad, cambios de responsable, comentarios,
      eliminación de comentarios, adjuntos, cierre
- [ ] Auditoría: registrar creación/eliminación de comentarios y tareas

---

# 6. Paneles (RF-013, RF-014, RF-015, RF-016, RF-017)

- [ ] Panel de usuario: solo sus propios tickets
- [ ] Panel del Departamento de Sistemas: todos los tickets
- [ ] Vista lista y vista tarjetas
- [ ] Filtros combinables (estado, prioridad, tipo, técnico, usuario,
      sector, sucursal, fecha)
- [ ] Búsquedas (número, usuario, título, contenido, responsable)

---

# 7. Adjuntos (RF-019)

- [ ] Conector de `adjuntos` (tickets, comentarios, tareas técnicas)
- [ ] Restricciones de tamaño y tipo de archivo (valores a definir)
- [ ] Auditoría: registrar adjuntos agregados o eliminados

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

- [ ] Middleware/lógica de autorización por rol (Usuario, Técnico,
      Administrador), reutilizando `req.usuario` que ya arma el
      middleware de autenticación
