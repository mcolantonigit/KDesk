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

- [x] Registro de usuarios: validación de dominio @tuempresa.com, correo
      duplicado y hasheo de contraseña
- [x] Auditoría: registrar alta de usuario (registro)
- [x] Login con JWT en cookie httpOnly
- [x] Logout
- [x] Middleware de autenticación (`requiereAutenticacion`)
- [x] Recuperación de contraseña: `/recuperar-contrasena` pide el
      correo (siempre responde igual, exista o no, para no filtrar qué
      cuentas están registradas) y manda un mail con link a
      `/resetear-contrasena?token=...` (vence en 1 hora, un solo uso).
      Pasa a ser parte del alcance v1 (antes decía "versión futura,
      no es parte de la v1 según PROJECT.md")
- [x] Envío de mail de activación al registrarse: cuenta nueva queda
      `email_verificado = false`; se manda un mail con link a
      `/activar-cuenta?token=...` (vence en 24hs, un solo uso). El login
      queda bloqueado (403) hasta que se activa. Si el envío del mail
      falla, se hace rollback completo del alta (no queda un usuario
      "fantasma" sin poder activarse ni volver a registrarse)
- [x] Infraestructura de mail: Nodemailer + SMTP de Microsoft 365
      (`smtp.office365.com:587`), credenciales por `.env`
      (`SMTP_HOST/PORT/USER/PASSWORD/FROM`, `FRONTEND_URL` para armar
      los links). Hacía falta `requireTLS: true` en el transporter —
      sin eso Office 365 rechazaba el login (error 535) aunque la
      contraseña fuera correcta, porque el tenant exige TLS antes de
      autenticar. Probado con un registro real: el mail sale
      correctamente (`prueba.mailreal@tuempresa.com`, `email_verificado: false`
      hasta que se activa desde el link del mail)
- [x] Tabla `tokens_verificacion` (un solo uso, con expiración, tipo
      ACTIVACION/RESET_PASSWORD, `ON DELETE CASCADE` contra usuarios).
      Usuarios ya existentes antes de este cambio se marcaron
      `email_verificado = true` para no bloquearlos retroactivamente
- [x] Probado de punta a punta con tokens generados a mano (sin
      credenciales SMTP reales todavía): activación, doble uso de token
      rechazado, reset con contraseñas que no coinciden rechazado,
      reset exitoso, login con la contraseña nueva
- [x] `FRONTEND_URL` pasó de `http://localhost:5173` a la IP de la
      máquina (`http://192.168.20.70:5173`) — los links de los mails con
      "localhost" solo funcionan en la PC que corre el backend, no desde
      el resto de la red. Pendiente para cuando haya un dominio/DNS real
      de producción: `FRONTEND_URL` pasa a ser ese dominio
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
- [x] Registro: permitir también los dominios @otraempresa.com y
      @tuempresa.cl (antes solo @tuempresa.com). Había DOS validaciones que
      actualizar: la del servicio (`usuarios.service.js`) y una
      restricción `CHECK` a nivel de base de datos (`chk_correo_dominio`)
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
- [x] Checklist del ticket: botón "Eliminar checklist" movido abajo a la
      derecha (`align-self: flex-end` en `.checklist-boton-eliminar-todo`)
- [x] Checklist del ticket: al presionar Enter en el texto de una tarea
      se guarda el texto actual, se crea una tarea nueva vacía y el foco
      pasa a su input (ref por id de tarea + estado `focoPendiente`),
      permitiendo encadenar altas sin tocar el botón "+"
- [x] Checklist del ticket: destildar una tarea completada vuelve a
      marcarla como pendiente. `PATCH /tareas/:id/completar` pasa a ser
      un toggle en el backend (antes rechazaba con 400 si ya estaba
      completada); nuevo evento de historial `TAREA_REABIERTA` además
      de `TAREA_COMPLETADA`. El checkbox del frontend deja de
      deshabilitarse cuando la tarea está completada
- [x] Detalle de ticket / Nuevo comentario: el input de adjunto quedaba
      pegado arriba porque `.form-field input` fija `height: 48px` pero
      el contenido nativo de `input[type="file"]` no se autocentra en
      esa altura. Se agregó una regla específica
      `.form-field input[type='file'] { display: flex; align-items: center }`
- [x] Dropdown "Administrar" del header pasa a ser visible para los 3
      roles (antes solo técnico/administrador). Dentro: "Cambiar
      contraseña" (nuevo, arriba de todo, solo roles usuario/técnico —
      abre `ModalCambiarPassword`, reutiliza `PUT /usuarios/perfil/password`
      ya existente con 3 campos: actual, nueva y confirmación; éxito
      muestra "Contraseña cambiada", error muestra el mensaje del
      backend), "Usuarios y permisos"/"Parámetros" (solo administrador,
      sin cambios), "Estadísticas"/"Auditoría" (ahora con guard propio
      de rol técnico/administrador, antes heredaban la visibilidad del
      dropdown completo) y "Fondo animado" (checkbox, abajo de todo,
      visible para los 3 roles — se movió acá desde la página
      Parámetros, que quedó sin ese checkbox; se borró `Parametros.css`
      por quedar sin ninguna regla en uso)
- [x] "Usuarios y permisos": columna "ID" sacada de la tabla. Columna
      "Activo" con botón "Deshabilitar"/"Habilitar" por fila (antes era
      solo texto Sí/No, oculta por defecto); al deshabilitar pide
      confirmación con `window.confirm` explicando que no borra al
      usuario de la base pero le impide usar el sistema (mismo patrón
      que `TablaCatalogo.jsx` para sucursales/sectores/etc.). Checkbox
      "Mostrar deshabilitados" arriba de la tabla (oculta deshabilitados
      por defecto). Encabezado "Acciones" renombrado a "Contraseña".
      Ordenamiento por click en encabezado agregado a toda la tabla
      (incluida "Activo"), salvo "Contraseña". Nuevo endpoint
      `PATCH /usuarios/:id/activo` (admin-only, con auditoría
      HABILITAR_USUARIO/DESHABILITAR_USUARIO); un administrador no puede
      deshabilitarse a sí mismo. El login ahora rechaza (403) a usuarios
      con `activo = false` — **decisión de alcance**: no se cortan las
      sesiones ya abiertas al deshabilitar (JWT stateless, sin
      revocación), solo se bloquea el próximo login
- [x] Nuevo Ticket: rol técnico/administrador puede elegir "Usuario que
      crea el ticket" (select opcional, mismo patrón que Sucursal/Sector
      ya existentes; lista todos los usuarios activos, no solo rol 1).
      **Decisión de diseño**: se separó "quién queda como dueño del
      ticket" de "quién queda registrado como autor en auditoría e
      historial" — si un técnico crea a nombre de otro usuario, el
      ticket pasa a pertenecer a ese usuario (aparece en su Mis tickets,
      puede cerrarlo, define sucursal/sector por defecto y el nombre
      descriptivo), pero auditoría/historial siguen registrando al
      técnico que lo cargó (accountability), con el detalle del evento
      aclarando "a nombre de [usuario]". Backend: `tickets.service.js`
      ahora distingue `idUsuarioActor` (quien hace la request) de
      `idUsuarioCreador` (dueño final del ticket, antes eran siempre el
      mismo valor)
- [x] Rendimiento: varias pantallas (Usuarios y permisos, Tablero,
      Estadísticas, Auditoría) se sentían trabadas al hacer scroll
      (caídas de FPS). Causa: `backdrop-filter: blur(14px)` sobre
      paneles grandes que se mueven con el scroll (`.tabla-tickets-scroll`
      y `.tablero-toolbar`, esta última además con `position: sticky`,
      la peor combinación posible ya que fuerza recalcular el blur en
      cada frame). Se sacó el `backdrop-filter` de esos dos y se pasó
      `.tablero-toolbar` a fondo sólido (`var(--bg)`, igual que el
      header) en vez de translúcido, para que siga tapando bien el
      contenido que scrollea debajo al quedar pegada arriba. Los demás
      usos de `backdrop-filter` (dropdowns chicos, modales, tarjeta de
      login) se dejaron igual: son paneles pequeños y estáticos, no
      pesan. Confirmado a mano por Matías: "va como piña"
- [x] Registro: los 7 campos pasan a un grid de 2 columnas
      (`.registro-campos`) para verse más equilibrado — Correo ocupa la
      fila completa, el resto se empareja (Nombre/Apellido,
      Contraseña/Confirmar, Sucursal/Sector). Media query a 720px
      (mismo breakpoint que ya usa `Inicio.css`) vuelve a 1 columna en
      celulares. Tarjeta ensanchada a 560px solo para esta pantalla
      (`.auth-card-registro`, vía nuevo prop `className` en
      `AuthLayout`/`FormField`) — Login y el resto de las pantallas de
      auth no se tocaron. Fix de un desborde: `grid-template-columns: 1fr
      1fr` sin `minmax(0, ...)` no deja que las columnas bajen de su
      ancho mínimo de contenido y desbordaba la tarjeta. Link "¿Ya tenés
      cuenta?" centrado (`justify-content: center`) con una clase aparte
      para no romper el `space-between` de los dos links de Login
- [x] Detalle de ticket (`/tickets/:id`): agregados "Creado por",
      "Sucursal" y "Sector" junto a Estado/Tipo/Prioridad. Para rol
      usuario se muestra directamente su propio nombre (un ticket
      siempre es suyo); para técnico/administrador se resuelve contra
      `GET /usuarios` (mismo patrón que ya usa el Tablero), reflejando
      correctamente cuando el ticket fue creado "a nombre de" otro
      usuario. Sin cambios de backend
- [x] Tablero → toolbar: "Filtrar", "Nuevo ticket" y "Generar reporte"
      (botón `Button` compartido, 48px de alto) quedaban más altos que
      la barra de búsqueda y los botones Lista/Tarjetas (40px). Fix
      acotado a la toolbar (`.tablero-toolbar-fila .btn { height: 40px
      }` en `Tablero.css`) en vez de tocar el `Button` global, para no
      afectar Login/modales/formularios. De paso empareja el botón
      "Columnas" de Usuarios y permisos, que comparte la misma clase

---

# 11. Backups

Pantalla nueva `/administrar/backups`, disponible únicamente para roles
técnico y administrador (rol 2 y 3), agregada al dropdown "Administrar"
del header junto a Estadísticas/Auditoría.

- [x] Mecanismo: `pg_dump`/`psql` (herramientas oficiales del cliente de
      Postgres) invocadas vía `child_process` desde `backend/utils/backup.util.js`
      — no son dependencias npm, sino un requisito de infraestructura
      nuevo (el server necesita el cliente de Postgres instalado).
      Variable de entorno nueva `PG_BIN_DIR` (ruta a la carpeta `bin` de
      la instalación de Postgres) para el caso de que esos binarios no
      estén en el PATH del sistema — en esta máquina apuntando a
      `C:\Program Files\PostgreSQL\18\bin`. **Autorizado explícitamente
      por Matías** antes de implementar
- [x] Backup manual: botón "Generar backup ahora", corre `pg_dump
      --format=plain --clean --if-exists` (dump en SQL plano,
      inspeccionable, con los DROP necesarios ya incluidos para que
      restaurar sea un simple `psql -f archivo.sql`) contra la carpeta
      `backend/backups/` (nueva, gitignoreada salvo `.gitkeep`, mismo
      patrón que `uploads/`)
- [x] Backup automático programado: nueva sección "Backup automático"
      con checkbox activar/desactivar, checkboxes de día (Lun a Dom) y
      hora. Configuración persistida en `configuracion_sistema`
      (columnas nuevas `backup_automatico_activo`, `backup_dias`
      —CSV de 0-6, domingo=0, convención `Date.getDay()`—, `backup_hora`).
      Job `backend/jobs/backups.job.js` (mismo estilo que
      `limpiezaLogs.job.js`): chequea cada 60 segundos si el
      día/hora/minuto actual matchea la configuración, con guarda en
      memoria para no disparar dos veces el mismo minuto
- [x] Restaurar desde un backup ya generado (listado de la carpeta, con
      nombre/fecha/tamaño) o desde un archivo `.sql` subido a mano.
      **Antes de restaurar, el sistema genera automáticamente un backup
      de seguridad del estado actual** (decisión tomada con Matías, dado
      que restaurar reemplaza toda la base). Confirmación con
      `window.confirm` explicando la severidad (mismo patrón que
      "Limpiar logs y auditorías"). Restauración acotada al esquema
      `public` de la base ya existente (`--clean --if-exists`, no
      dropea/recrea la base completa, así no hace falta una conexión
      aparte fuera del pool de la app)
- [x] Descargar cualquier backup de la lista (`GET
      /backups/:nombreArchivo/descargar`, mismo patrón que la descarga
      de adjuntos de tickets)
- [x] Auditoría: `BACKUP_MANUAL` y `RESTAURACION_BACKUP` (esta última
      deja registrado en el detalle el nombre del backup de seguridad
      generado antes de restaurar)
- [x] Probado de punta a punta contra la base real: generación de dump
      (1876 líneas), restauración del mismo dump sobre la propia base
      (`--clean --if-exists`) y verificación de que los datos siguieron
      intactos (15 usuarios, 14 tickets) después del ciclo completo

---

# 12. Entorno de desarrollo y tests

Branch `develop`: backend sin TLS en `localhost:4000`, base `kdesk_dev`
(clon de producción) en el server de la red, y todo mail redirigido a
`MAIL_REDIRECT_TO`. Al hacer merge a `main`, el `.env` del server sigue
siendo el de producción (con TLS, `COOKIE_SECURE=true` y sin
`MAIL_REDIRECT_TO`).

- [x] Backend: HTTP plano si `TLS_PFX_PATH` está vacío; `MAIL_REDIRECT_TO`
      en el mailer; `.gitignore` con `.env*`
- [x] Frontend: proxy de Vite configurable con `VITE_API_TARGET`
      (`frontend/.env.development`)
- [x] `database/clone-to-dev.ps1` (clona `kdesk` en `kdesk_dev`) y
      `backend/scripts/db.js` (SQL contra dev/test; se niega a correr
      contra `kdesk`)
- [x] Tests de frontend: Vitest + Testing Library (`npm test` en `frontend/`)
- [x] Tests de backend: Vitest + Supertest sobre la base `kdesk_test`
      (`npm run test:db` la recrea desde `schema.sql`; `npm test` en
      `backend/`). Primer cubrimiento: comentarios
- [x] `npm audit fix` en frontend y backend; `nodemailer` subido a 10.2.1.
      Quedan 3 avisos de `nodemon`/`braces`/`chokidar` (solo desarrollo;
      el arreglo obliga a bajar nodemon a una versión vieja)

# 13. Mejoras de UI/UX (pendientes, en `develop`)

Se trabajan en este orden; cada bloque se prueba en `localhost:5173`, se
aprueba y se commitea por separado.

**Bloque 1 — Base visual**
- [x] Botón "volver" (`detalle-ticket-volver` y los demás botones de
      atrás del sistema): rediseño acorde a la estética de KDesk, con ícono SVG
- [x] `btn btn-secondary`: corregir padding (se ve feo); además más chico en el Tablero
- [x] Componente de subida de archivos (hoy `<input type="file">` crudo en
      nuevo ticket, comentarios, cierre de ticket y restaurar backup):
      zona de arrastrar/soltar con ícono SVG, nombre del archivo elegido y
      botón para quitarlo

**Bloque 2 — Componente `Combobox`**
- [x] Input escribible que reemplaza a los `<select>` de nuevo ticket: sugiere
      la opción más cercana a lo escrito, y no deja guardar un valor que no
      esté en el listado
- [x] Todos los listados de opciones ordenados alfabéticamente

**Bloque 3 — Modal de nuevo ticket**
- [x] Reemplazar la página `/tickets/nuevo` por una ventana modal que se abre
      desde "Nuevo ticket"
- [x] Acomodar los campos en columnas (evaluar 2) para pantallas 16:9 sin tanto scroll

**Bloque 4 — Modal de motivo de cierre**
- [x] "Cerrar ticket" abre el motivo de cierre como modal por encima del
      detalle (hoy se abre inline y se pierde entre la info)

**Bloque 5 — Detalle de ticket en 16:9**
- [x] Reordenar la info del detalle (`/tickets/:id`) en columnas y más
      compacta para reducir el scroll en escritorio
- [x] Mostrar quién cargó cada comentario (`comentarios.id_autor` ya existe
      en la base; falta traer nombre/apellido en la consulta). Test primero (TDD)

**Bloque 6 — Aside lateral de ticket**
- [x] Click en una fila de la tabla de tickets abre un aside a la derecha con
      una versión acotada del detalle, con animación que entra de derecha a
      izquierda (hoy navega a `/tickets/:id`)

**Bloque 7 — Tabla de tickets**
- [x] Encabezados con ancho ajustable arrastrando el borde, para evitar
      el scroll horizontal innecesario

**Bloque 8 — Tablero**
- [x] Sacar el H1 de `/dashboard/tablero` y subir `tablero-toolbar`
- [x] Botones `btn-secondary` del Tablero más chicos

**Bloque 9 — Novedades**
- [x] Rediseñar la vista de Novedades como un panel más útil, con la
      información más importante para cada técnico (a definir con Matías
      antes de implementar)

**Pendientes técnicos**
- [ ] Merge de `develop` a `main` y deploy: build del frontend en el server
      (`dist` no está en git), reinicio de la tarea "KDesk Backend" y
      verificar que el `.env` del server no tenga valores de dev

# 14. Notificaciones y alertas

Popups tipo Windows (abajo a la derecha) con sonido y lectura por voz (TTS
del navegador), y lista "Notificaciones" en Novedades. Preferencias por tipo
en una página "Alertas" del menú de configuración. Se guardan en el
navegador (las voces cambian según navegador y PC).

Tipos de notificación: ticket nuevo (técnicos), asignado a mí, comentario
nuevo y cambio de estado o cierre (para creador y responsable). Nunca se
notifica una acción propia.

- [x] Etapa 1 — Backend: `GET /api/notificaciones?despuesDe=&limite=`, armado
      desde `historial_ticket` (sin tablas nuevas), con cursor `ultimoId`,
      texto en pantalla y texto para leer en voz alta (`mensajeVoz`)
- [x] Etapa 2 — Popups (apilados, se cierran solos, clic abre el ticket),
      sonido (Web Audio) y TTS; consulta cada 20 s y al volver a la pestaña
- [x] Etapa 3 — Página "Alertas" (`/configuracion/alertas`): interruptor
      general, volumen, popup/sonido/voz por tipo, selector de voz con
      "Escuchar prueba". Voz por defecto: Edge "Microsoft Gonzalo Online
      (Natural)"; Chrome "Google español" (en línea)
- [x] Etapa 4 — Novedades: "Requieren atención" pasa a "Notificaciones" y
      mezcla el feed con las alertas actuales (alta/crítica y sin movimiento)
- Limitaciones: solo avisa con KDesk abierto en una pestaña; el navegador no
  deja sonar ni hablar antes del primer clic en la página

# 15. Versión móvil (celular, hasta 768px)

Se trabaja en tandas, con un commit por tanda. Navegación: barra inferior
(Novedades/Inicio, Tickets, "+", Tablero/Cerrados, Más). En el celular las
tablas pasan a listas de tarjetas y los modales/paneles a pantallas completas.

- [x] Tanda 1 — Estructura: barra superior compacta, barra inferior con menú
      "Más", márgenes, controles táctiles (44px, campos de 16px), login
- [x] Tanda 2 — Novedades, Tickets y Tablero como tarjetas; detalle del ticket
- [ ] Tanda 3 — Nuevo ticket, cierre y panel del ticket como pantallas
      completas; popups de notificación
- [ ] Después — Alertas, Apariencia y administración (Estadísticas, Auditoría,
      Backups, Usuarios, Parámetros)
