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

- Solo se permitirán correos pertenecientes al dominio:

@kalop.com.ar

No se permitirá el registro con dominios externos.

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

La arquitectura deberá permitir agregar nuevos tipos en futuras versiones.

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

La arquitectura deberá permitir agregar nuevos estados.

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
- Cierre

El historial nunca podrá eliminarse.

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

Funcionalidad prevista para futuras versiones.

Permitirá adjuntar archivos tanto a usuarios como a Técnicos.

---

# RF-020 - Estadísticas

Funcionalidad prevista para futuras versiones.

Permitirá obtener indicadores sobre:

- Tickets por sucursal
- Tickets por sector
- Tickets por técnico
- Tiempos de resolución
- Prioridades
- Tipos de Ticket

---

# RF-021 - Roles

Inicialmente existirán tres roles.

- Usuario
- Técnico
- Administrador

Cada funcionalidad estará protegida según el rol correspondiente.

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