# PROJECT.md

# KDesk

## Sistema de Gestión de Tickets Interno - Kalop

**Versión:** 1.0  
**Estado:** En planificación

---

# Descripción

KDesk es un sistema interno de gestión de tickets desarrollado para el Departamento de Sistemas de Kalop.

Su objetivo es centralizar todas las solicitudes de soporte técnico realizadas por los colaboradores de la empresa, eliminando la dependencia del correo electrónico, WhatsApp o llamados telefónicos como medio principal de comunicación.

El sistema permitirá administrar todo el ciclo de vida de un ticket, desde su creación hasta su cierre, facilitando la organización diaria del trabajo del Departamento de Sistemas y ofreciendo transparencia a todos los usuarios respecto al estado de sus solicitudes.

KDesk será desarrollado con una arquitectura preparada para crecer en el tiempo, permitiendo futuras integraciones con Inteligencia Artificial, correo electrónico, WhatsApp y otros servicios sin necesidad de rediseñar el sistema.

---

# Objetivos

KDesk deberá permitir:

- Centralizar todas las solicitudes de soporte técnico.
- Registrar cada ticket desde su creación hasta su resolución.
- Organizar la carga de trabajo diaria del Departamento de Sistemas.
- Priorizar solicitudes.
- Asignar responsables.
- Mantener un historial completo de cada ticket.
- Permitir que cada usuario conozca el estado de sus solicitudes.
- Obtener información que facilite la toma de decisiones y la mejora continua del servicio.

---

# Usuarios del sistema

## Usuario

Corresponde a cualquier colaborador de Kalop que posea una cuenta de correo corporativa **@kalop.com.ar**.

Podrá:

- Iniciar sesión.
- Crear nuevos tickets.
- Consultar el estado de sus tickets.
- Agregar información adicional.
- Cancelar tickets cuando corresponda.
- Consultar el historial de sus solicitudes.

---

## Técnico de Sistemas

Corresponde al personal del Departamento de Sistemas.

Podrá:

- Visualizar todos los tickets.
- Asignar prioridades.
- Modificar prioridades.
- Asignar responsables.
- Registrar avances.
- Crear tareas técnicas asociadas al ticket.
- Cambiar estados.
- Resolver tickets.
- Cerrar tickets.
- Consultar estadísticas.
- Administrar su propia cola de trabajo.

---

## Administrador

Será responsable de la administración general del sistema.

Entre otras funciones podrá:

- Administrar usuarios.
- Administrar técnicos.
- Blanquear credenciales de otros usuarios.
- Administrar sucursales.
- Administrar categorías.
- Configurar prioridades.
- Configurar estados.
- Administrar permisos.
- Acceder a estadísticas generales.

---

# Concepto principal

La entidad principal del sistema será el **Ticket**.

Un ticket representa cualquier interacción entre un colaborador y el Departamento de Sistemas.

Cada ticket podrá pertenecer a un tipo determinado.

Ejemplos:

- Incidente
- Solicitud de Servicio
- Instalación de Software
- Solicitud de Hardware
- Alta de Usuario
- Cambio de Contraseña
- Otro

Esto permitirá ampliar el alcance del sistema en futuras versiones sin modificar su arquitectura principal.

---

# Filosofía del producto

KDesk no busca replicar herramientas como Jira, GLPI o Microsoft Planner.

Su objetivo es convertirse en la herramienta diaria del Departamento de Sistemas de Kalop.

El sistema deberá priorizar:

- simplicidad;
- velocidad;
- claridad;
- facilidad de mantenimiento;
- escalabilidad;
- bajo acoplamiento entre módulos;
- experiencia de usuario intuitiva.

Cada decisión de diseño deberá favorecer la comprensión del sistema antes que la complejidad técnica.

El código deberá ser claro, legible y fácilmente mantenible.

---

# Objetivo operativo

KDesk deberá transformarse en el centro de operaciones del Departamento de Sistemas.

El panel principal deberá permitir que un técnico conozca inmediatamente:

- qué tickets están pendientes;
- cuáles poseen mayor prioridad;
- quién es el responsable de cada uno;
- cuál es la carga de trabajo del equipo;
- qué tareas requieren atención inmediata.

El flujo diario del sector deberá poder administrarse principalmente desde KDesk.

---

# Alcance de la primera versión

La primera versión incluirá exclusivamente la gestión manual de tickets.

Se desarrollarán las funcionalidades necesarias para:

- autenticación;
- administración de usuarios;
- creación de tickets;
- seguimiento;
- asignación;
- prioridades;
- comentarios;
- historial;
- panel del Departamento de Sistemas;
- panel de administración (usuarios, técnicos, sucursales, categorías, prioridades, estados, permisos y estadísticas generales);
- adjuntos en tickets, comentarios y tareas técnicas;
- estadísticas.

No formarán parte de la primera versión:

- Inteligencia Artificial.
- Integración con correo electrónico.
- Integración con WhatsApp.
- Automatización de creación de tickets.
- Notificaciones automáticas.
- Base de conocimiento.

Estas funcionalidades serán incorporadas en futuras versiones.

---

# Visión a largo plazo

La arquitectura deberá permitir incorporar nuevas funcionalidades sin modificar el núcleo del sistema.

Entre ellas:

- Agentes de Inteligencia Artificial.
- Creación automática de tickets desde correo electrónico.
- Creación automática de tickets desde WhatsApp.
- Chat interno.
- Notificaciones.
- Dashboard ejecutivo.
- Estadísticas.
- Base de conocimiento.
- Integración con Microsoft 365.
- Integración con Active Directory.
- Automatización de tareas repetitivas.

---

# Criterios de éxito

El proyecto será considerado exitoso cuando:

- Todos los colaboradores utilicen KDesk como canal principal para solicitar soporte.
- El Departamento de Sistemas administre su trabajo diario desde KDesk.
- Cada ticket posea trazabilidad completa.
- Se reduzca significativamente el uso de correos y mensajes informales para solicitar soporte.
- Los usuarios puedan conocer en todo momento el estado de sus solicitudes.
- El sistema pueda evolucionar sin necesidad de rediseños importantes.
