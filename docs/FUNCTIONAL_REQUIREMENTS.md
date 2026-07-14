# FUNCTIONAL_REQUIREMENTS.md

# KDesk

## Requerimientos Funcionales

Versión: 1.0

---

# Introducción

Este documento describe el comportamiento funcional esperado para KDesk.

Su finalidad es servir como referencia durante todo el desarrollo del proyecto, definiendo qué debe hacer el sistema sin especificar detalles técnicos de implementación.

---

# RF-001 - Autenticación

El sistema permitirá acceder únicamente a colaboradores de Kalop mediante su correo corporativo.

## Requisitos

- Inicio de sesión mediante correo electrónico y contraseña.
- Cierre de sesión.
- Mantener sesión iniciada.
- Recuperación de contraseña (versión futura).

## Restricciones

- Solo se permitirán correos pertenecientes a alguno de estos dominios
  (decisión de producto 2026-07-14: se suman los dos últimos a la lista
  original que solo tenía @kalop.com.ar):

@kalop.com.ar
@ergoscables.com.ar
@kalop.cl

No se permitirá el registro con dominios externos a esta lista.

---

# RF-002 - Registro de Usuarios

Los colaboradores podrán registrarse por primera vez.

Durante el registro deberán completar:

- Nombre
- Apellido
- Correo corporativo
- Contraseña
- Confirmación de contraseña
- Sucursal
- Sector

El sistema validará:

- formato del correo
- dominio permitido
- correo duplicado
- contraseña segura

Sucursal y Sector deberán seleccionarse desde un listado definido por el sistema.

---

# RF-003 - Perfil del Usuario

Cada usuario dispondrá de un perfil personal.

Podrá visualizar:

- Nombre
- Apellido
- Correo
- Sucursal
- Sector
- Fecha de registro

Podrá modificar:

- Contraseña

No podrá modificar:

- Correo electrónico
- Sucursal
- Sector

---

# RF-004 - Creación de Tickets

Todo usuario autenticado podrá crear nuevos tickets.

El formulario solicitará únicamente la información necesaria.

## Campos ingresados por el usuario

- Tipo de Ticket
- Prioridad sugerida
- Título
- Descripción del problema

## Restricciones

El título será obligatorio y tendrá una longitud máxima de caracteres (valor a definir).

La descripción será obligatoria.

## Información generada automáticamente

Al guardar el ticket, el sistema completará automáticamente:

- Número de Ticket
- Usuario creador
- Sector
- Sucursal
- Fecha y hora de creación
- Estado inicial
- Responsable (sin asignar)

Además, el sistema construirá automáticamente el nombre descriptivo del ticket utilizando el siguiente formato:

Sector - Nombre del Usuario - Título ingresado por el usuario

Ejemplo:

Ventas - Juan Pérez - Instalación de Office en notebook nueva

---

# RF-005 - Número de Ticket

Cada ticket deberá poseer un identificador único y visible.

Formato sugerido:

TK-000001

Este identificador será utilizado como referencia principal dentro del sistema.

Nunca deberá modificarse.

---

# RF-006 - Tipos de Ticket

Inicialmente existirán los siguientes tipos:

- Incidente
- Solicitud de Servicio
- Instalación de Software
- Solicitud de Hardware
- Alta de Usuario
- Cambio de Contraseña
- Otro

El Administrador podrá agregar, editar y dar de baja tipos de ticket desde el Panel de Administración (ver RF-024).

---

# RF-007 - Estados

Todo ticket deberá poseer un estado.

Estados iniciales:

- Pendiente
- Asignado
- En proceso
- En espera del usuario
- Resuelto
- Cerrado
- Cancelado

El Administrador podrá agregar, editar y dar de baja estados desde el Panel de Administración (ver RF-024).

---

# RF-008 - Prioridades

Cada ticket tendrá una prioridad.

Prioridades disponibles:

- Baja
- Media
- Alta
- Crítica

El usuario podrá sugerir una prioridad.

La prioridad definitiva será establecida por un Técnico.

El Administrador podrá configurar las prioridades disponibles desde el Panel de Administración (ver RF-024).

---

# RF-009 - Asignación

Cada ticket podrá asignarse a un Técnico.

Solo existirá un responsable principal por ticket.

En futuras versiones podrán incorporarse colaboradores secundarios.

---

# RF-010 - Comentarios

Todo ticket dispondrá de un historial de comentarios.

Cada comentario registrará:

- Autor
- Fecha
- Hora
- Contenido

Los comentarios podrán eliminarse.

La eliminación deberá registrarse en el historial del ticket.

---

# RF-011 - Tareas Técnicas

Los Técnicos podrán crear una lista de tareas internas asociadas al ticket.

Cada tarea podrá marcarse como completada.

Estas tareas solo serán visibles para el Departamento de Sistemas.

---

# RF-012 - Historial

Cada ticket conservará un historial cronológico de eventos.

Como mínimo deberán registrarse:

- Creación
- Cambios de estado
- Cambios de prioridad
- Cambios de responsable
- Comentarios
- Eliminación de comentarios
- Adjuntos agregados o eliminados
- Cierre

El historial se conserva por un período configurable (por defecto 365
días) desde el Panel de Administración → Auditoría. Una tarea automática
corre todas las noches a las 00:00hs y elimina las entradas de
`historial_ticket` más viejas que ese período; también existe una
limpieza manual inmediata. El ticket en sí (tabla `tickets`) nunca se
toca ni se elimina por esta limpieza, solo su historial de eventos más
antiguo. (Decisión de producto 2026-07-14: reemplaza la redacción
original "el historial nunca podrá eliminarse").

---

# RF-013 - Panel del Usuario

Cada usuario visualizará únicamente sus propios tickets.

Podrá:

- Crear tickets.
- Consultar estado.
- Agregar comentarios.
- Cancelar tickets cuando corresponda.
- Consultar historial.

---

# RF-014 - Panel del Departamento de Sistemas

Los Técnicos visualizarán todos los tickets.

El panel permitirá:

- Buscar
- Filtrar
- Ordenar
- Asignar responsables
- Modificar estados
- Modificar prioridades
- Gestionar tareas técnicas
- Administrar comentarios

---

# RF-015 - Modos de Visualización

El panel del Departamento de Sistemas dispondrá de dos modos.

## Vista Lista

Mostrará información resumida.

Como mínimo:

- Número
- Prioridad
- Estado
- Usuario
- Sector
- Sucursal
- Responsable
- Fecha
- Título

---

## Vista Tarjetas

Mostrará información ampliada.

Como mínimo:

- Número
- Prioridad
- Estado
- Usuario
- Sector
- Sucursal
- Responsable
- Fecha
- Título
- Descripción resumida
- Indicadores principales

---

# RF-016 - Filtros

El sistema permitirá combinar filtros por:

- Estado
- Prioridad
- Tipo
- Técnico
- Usuario
- Sector
- Sucursal
- Fecha

---

# RF-017 - Búsquedas

El sistema permitirá buscar tickets por:

- Número de Ticket
- Usuario
- Título
- Contenido
- Responsable

---

# RF-018 - Fechas

Cada ticket almacenará automáticamente:

- Fecha de creación
- Fecha de última actualización
- Fecha de cierre

---

# RF-019 - Adjuntos

El sistema permitirá adjuntar archivos en:

- Tickets.
- Comentarios.
- Tareas técnicas.

Tanto Usuarios como Técnicos podrán adjuntar archivos, según su nivel de acceso a cada elemento (por ejemplo, las tareas técnicas solo son visibles para el Departamento de Sistemas, según RF-011).

## Restricciones

- Tamaño máximo por archivo (valor a definir).
- Tipos de archivo permitidos (valor a definir).

---

# RF-020 - Estadísticas

El sistema permitirá obtener indicadores sobre:

- Tickets por sucursal
- Tickets por sector
- Tickets por técnico
- Tiempos de resolución
- Prioridades
- Tipos de Ticket

Estas estadísticas serán accesibles desde el Panel de Administración (ver RF-024).

---

# RF-021 - Roles

Inicialmente existirán tres roles.

- Usuario (rol 1)
- Técnico (rol 2)
- Administrador (rol 3)

Cada funcionalidad estará protegida según el rol correspondiente.

## Usuario maestro

El rol Administrador (rol 3) queda reservado exclusivamente para el
usuario maestro `sistemas@kalop.com.ar`. Ese usuario no se crea por el
flujo de registro público: se da de alta y se le asigna el rol 3
manualmente (por ejemplo, directamente en la base de datos). Ningún
otro usuario podrá tener el rol 3.

---

# RF-022 - Auditoría

Todas las acciones importantes deberán registrarse automáticamente.

Como mínimo:

- Usuario
- Acción
- Fecha
- Hora

---

# RF-023 - Escalabilidad

La arquitectura deberá permitir futuras integraciones con:

- Inteligencia Artificial
- Correo electrónico
- WhatsApp
- Microsoft 365
- Active Directory
- Base de conocimiento

Estas integraciones deberán poder incorporarse sin modificar el núcleo funcional del sistema.

---

# RF-024 - Panel de Administración

El rol Administrador dispondrá de un panel exclusivo para la administración general del sistema.

## Requisitos

- Administrar usuarios: alta, edición y baja.
- Administrar técnicos: alta, edición y baja.
- Blanquear las credenciales de cualquier usuario o técnico.
- Administrar sucursales: alta, edición y baja.
- Administrar categorías (tipos de ticket, ver RF-006): alta, edición y baja.
- Configurar las prioridades disponibles (ver RF-008).
- Configurar los estados disponibles (ver RF-007).
- Administrar permisos por rol: el usuario maestro (ver RF-021) podrá
  cambiar el rol de cualquier otro usuario registrado, asignando
  únicamente rol 1 (Usuario) o rol 2 (Técnico).
- Acceder a las estadísticas generales del sistema (ver RF-020).

## Restricciones

- Todas las acciones realizadas desde este panel deberán quedar registradas en la auditoría (ver RF-022).
- El blanqueo de credenciales no expondrá la contraseña anterior del usuario.
- El cambio de rol nunca podrá asignar el rol 3 (Administrador): ese
  rol queda reservado al usuario maestro `sistemas@kalop.com.ar` (ver
  RF-021).