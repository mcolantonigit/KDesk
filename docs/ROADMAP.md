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
- [x] Administrar permisos por rol: cubierto el cambio usuario ↔
      técnico desde "Usuarios y permisos". No hay (ni se necesita) forma
      de ascender/crear un administrador desde la interfaz: va a existir
      un único administrador, y si eso cambia en el futuro se provisiona
      manualmente por pgAdmin, no por la app
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
- [x] Revisado: técnico y administrador comparten el mismo nivel de
      acceso operativo sobre tickets (estados, prioridades, responsable,
      tareas técnicas, cierre, comentarios) y también ven Dashboard,
      Estadísticas y Auditoría por igual. La única distinción real es
      dentro de "Administrar": "Usuarios y permisos" y "Parámetros" son
      admin-only (`requiereRolAdministrador`). No hace falta separar más
      — va a haber un solo administrador, provisionado manualmente por
      pgAdmin, no desde la app

---

# 10. Mejoras previas a producción

Lista abierta de pulido pedida después de cerrar la v1 funcional. Cada
punto se implementa y se tilda por separado, no son parte de ningún RF
puntual.

- [x] "Usuarios y permisos" → blanqueo de contraseña: botón "Generar
      automáticamente" en `ModalBlanquearPassword` (10 caracteres
      alfanuméricos, garantiza mayúscula + minúscula + número; excluye
      caracteres ambiguos O/0/I/1/l), más un toggle "Mostrar/Ocultar"
      para poder leer y copiar la contraseña generada
- [x] Detalle de ticket (`/tickets/:id`): la sección "Historial" ahora
      se muestra con el evento más reciente primero, recortada a los
      últimos 10, con botón "Cargar 10 más" que expande de a 10 (se
      sigue trayendo todo el historial en una sola llamada; el recorte
      es en el cliente, dado el volumen esperado por ticket)
- [x] Pantalla de Auditoría (`/administrar/auditoria`): ordenar por
      cualquier encabezado de la tabla (igual que el Tablero); paginado
      real de a 10 con componente `Paginacion.jsx` (botones numerados +
      anterior/siguiente) debajo de la tabla; barra de herramientas
      arriba con búsqueda de texto libre (usuario, acción, detalle) y
      filtro de fecha "desde"/"hasta" con calendario (mismo control que
      el Tablero). Probado con los 68 eventos reales ya generados
- [x] Tablero → vista Tarjetas: Estado, Prioridad y Responsable ahora
      son `<select>` editables (mismos handlers que la vista Lista,
      con refresco silencioso sin perder el estado de la tarjeta), y
      se agregó la descripción del ticket recortada a 2 renglones con
      `-webkit-line-clamp` + `overflow: hidden`
- [x] Persistir en `localStorage` los filtros y la búsqueda de Auditoría
      y del Tablero (más la vista Lista/Tarjetas del Tablero), con el
      hook reutilizable `usePersistentState`
- [x] Tablero → botón "Generar reporte": CSV real (`utils/exportar.js`,
      sin dependencias nuevas — decisión: nada de librería PDF, PDF se
      resuelve con `window.print()` + CSS de impresión) con los tickets
      filtrados/buscados actuales; PDF vía "Exportar PDF (imprimir)" que
      dispara el diálogo de impresión del navegador. Se agregó un CSS
      de impresión global (`index.css`, clase `no-imprimir`) que oculta
      el header/nav y las columnas de acciones, y corrige los colores
      para que el texto se lea en papel blanco (la app fuerza tema
      oscuro y sin este ajuste el PDF salía ilegible)
- [x] Estadísticas → botón "Generar reporte": CSV con las 6 secciones
      apiladas (rango de fechas, promedio de resolución, resolución por
      técnico, y los 5 conteos), reutilizando `descargarCSV`/`filasACSV`
      del Tablero; PDF vía el mismo "Exportar PDF (imprimir)"
- [x] Retención y limpieza de logs (solo administrador): nueva tabla
      `configuracion_sistema` (fila única, `dias_retencion_logs`,
      default 365). En Auditoría: campo "Preservar auditorías desde
      actualidad hasta (días)" que persiste el valor, y botón "Limpiar
      logs y auditorías" (modal con confirmación) que borra ya mismo
      `auditoria` y `historial_ticket` más viejos que el corte indicado.
      Tarea automática todas las noches a las 00:00hs (`setTimeout`
      autoprogramado en `jobs/limpiezaLogs.job.js`, sin dependencias
      nuevas) que aplica el mismo borrado con el valor guardado. La
      tabla `tickets` nunca se toca, solo se poda su historial de
      eventos. **Decisión de producto que actualiza RF-012** (antes decía
      "el historial nunca podrá eliminarse") — reflejado en
      `FUNCTIONAL_REQUIREMENTS.md`. Probado con datos reales: un evento
      de auditoría de 400 días se borró con retención de 365; con
      retención de 100000 días no se borró nada
- [x] CSS global: `h1`, `h2`, `h3` con `caret-color: transparent` (se
      pueden seleccionar pero sin el cursor titilando); los `<button>`
      no deberían poder seleccionarse (`user-select: none`)
- [x] Botón "Nuevo Ticket" del nav ("Mis tickets" → submenú) en
      naranja/acento, no como link de texto plano
- [x] Centrar el contenido de "Nuevo Ticket" y el detalle de ticket
      (`/tickets/:id`) — hoy quedan pegados al margen izquierdo del
      panel en vez de centrados
- [x] Tablero → toolbar con efecto sticky (se pega arriba al scrollear
      la tabla), con 5px de margen para que no quede pegada del todo al
      borde superior de la pantalla (aplica a toda `.tablero-toolbar`,
      que también reusan Estadísticas/Auditoría/Usuarios y permisos)
- [x] Logo de KDesk en el nav: badge cuadrado redondeado con "K" en
      color de acento junto al texto "KDesk", todo envuelto en un
      `Link` a Inicio (`/`). No había ningún asset de logo, se armó
      como marca simple en CSS/JSX en vez de un ícono importado
- [x] Reemplazar textos por íconos en el nav: "Administrar" → ícono de
      engranaje, "Cerrar sesión" → ícono de puerta con flecha (ambos
      con `title`/`aria-label` para no perder accesibilidad)
- [x] Registro: permitir también los dominios @ergoscables.com.ar y
      @kalop.cl (antes solo @kalop.com.ar). Había DOS validaciones que
      actualizar: la del servicio (`usuarios.service.js`) y una
      restricción `CHECK` a nivel de base de datos (`chk_correo_kalop`)
      que no se había detectado al principio y también hacía falta
      alterar; probado registrando un usuario con cada uno de los 3
      dominios y confirmando que un dominio ajeno sigue rechazado
- [x] Auditoría: el campo "Preservar auditorías desde actualidad hasta
      (días)" salió del toolbar y ahora vive en un modal propio
      (`ModalConfigurarRetencion`, botón "Limpieza automática"); los
      botones "Limpiar logs y auditorías" y "Limpieza automática" están
      ubicados después de la tabla y la paginación, no en la barra de
      herramientas
- [x] Nuevo Ticket: si el usuario es rol técnico/administrador, aparecen
      selects de Sucursal y Sector para elegir a nombre de qué
      sucursal/sector se crea el ticket. Backend: `crearTicket` acepta
      `idSucursal`/`idSector` opcionales, pero solo los aplica si quien
      crea es técnico/admin (valida que existan); un usuario común que
      intente forzarlos vía API los tiene ignorados, siempre usa su
      propio perfil. Probado con ambos roles
- [x] Panel de "Novedades" — **ajuste de alcance en la implementación**:
      pasa a ser hijo de Dashboard (`/dashboard/novedades`, con su link
      en el submenú), solo para roles técnico/administrador; rol 1 no
      tiene esta pantalla. Contenido: tarjetas "sin asignar" / "asignados
      a vos" / "abiertos (total)", lista de los sin asignar más antiguos
      (proxy de "próximos a vencer" — sigue sin existir campo de
      vencimiento/SLA real en la base) y accesos directos (Nuevo ticket /
      Tablero). La ruta raíz `/` ahora es un redirect según rol: usuario
      común → `/tickets/activos`, técnico/admin → `/dashboard/novedades`
- [ ] Checklist del ticket: mover el botón "Eliminar checklist" abajo a
      la derecha (hoy queda a la izquierda, debajo de la lista)
- [ ] Checklist del ticket: al escribir una tarea y presionar Enter,
      debe crear una nueva tarea vacía y poner el foco ahí para seguir
      escribiendo (encadenar altas sin tocar el botón "+" cada vez)
- [ ] Checklist del ticket: destildar el checkbox de una tarea ya
      completada debe volver a marcarla como pendiente (hoy es de una
      sola dirección — una vez completada, el checkbox queda
      deshabilitado; hay que sumar el camino inverso, incluyendo el
      endpoint de backend si hace falta)
- [ ] Detalle de ticket / Nuevo comentario: el input de adjunto
      ("Seleccionar archivo, Ningún archivo seleccionado") queda pegado
      al margen superior del bloque — debería quedar centrado
      verticalmente como el resto de los campos
