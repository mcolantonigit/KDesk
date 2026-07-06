# CODING_RULES.md

# KDesk

## Reglas de Desarrollo

Versión: 1.0

---

# Objetivo

Estas reglas son obligatorias durante todo el desarrollo del proyecto.

Ante cualquier conflicto entre estas reglas y una decisión de implementación, prevalecerán las reglas definidas en este documento.

---

# Arquitectura

- Respetar la arquitectura MVC definida en ARCHITECTURE.md.
- No crear nuevas carpetas sin autorización.
- No modificar la estructura del proyecto sin autorización.
- Mantener una única responsabilidad por archivo.

---

# Desarrollo

- No mezclar funcionalidades distintas en una misma iteración.
- Explicar el enfoque antes de escribir código cuando el cambio sea significativo.
- Esperar aprobación antes de comenzar implementaciones grandes.
- No modificar archivos que no estén relacionados con la tarea solicitada.
- Evitar refactorizaciones masivas mientras se desarrolla una nueva funcionalidad.

---

# Código

- Priorizar código claro antes que código compacto.
- Escribir código fácil de mantener.
- Evitar duplicación.
- Utilizar nombres descriptivos para variables, funciones y componentes.
- Comentar únicamente cuando aporte valor. El código debe ser autoexplicativo.

---

# Dependencias

Las únicas dependencias aprobadas son las definidas en STACK.md.

No instalar nuevas dependencias sin autorización.

Si una dependencia resulta necesaria:

1. Explicar qué problema resuelve.
2. Justificar su incorporación.
3. Esperar autorización antes de utilizarla.

---

# Base de Datos

- No utilizar ORM.
- Utilizar SQL puro.
- Toda consulta SQL deberá implementarse exclusivamente en Models.

---

# Frontend

- No realizar llamadas HTTP fuera de `frontend/src/services`.
- Los componentes deberán limitarse a la interfaz y la interacción con el usuario.
- No mezclar lógica de negocio con la presentación.

---

# Backend

- Routes únicamente reciben peticiones y delegan al Controller.
- Controllers procesan la petición y coordinan la respuesta.
- Services contienen toda la lógica de negocio.
- Models contienen exclusivamente el acceso a la base de datos.

---

# Seguridad

- Nunca escribir credenciales, claves privadas o tokens directamente en el código.
- Toda información sensible deberá obtenerse mediante variables de entorno utilizando dotenv.
- Mantener actualizado el archivo `.env.example`.
- El archivo `.env` nunca deberá subirse al repositorio.

---

# Toma de Decisiones

Claude no deberá asumir decisiones funcionales.

Si existen varias alternativas válidas, deberá:

1. Explicar las opciones.
2. Indicar ventajas y desventajas.
3. Esperar la decisión del desarrollador.

---

# Comunicación

Cuando una solicitud sea ambigua:

- No asumir comportamientos.
- Realizar preguntas antes de implementar.

Si una implementación contradice PROJECT.md o FUNCTIONAL_REQUIREMENTS.md:

- Detener el desarrollo.
- Informar la inconsistencia.
- Esperar instrucciones.

---

# Conservación del Código

Antes de modificar una funcionalidad existente, evaluar si el cambio puede afectar el comportamiento actual.

Evitar romper funcionalidades previamente implementadas.

Si existe riesgo de regresión, informar al desarrollador antes de realizar el cambio.

---

# Objetivo del Proyecto

El objetivo principal no es únicamente desarrollar KDesk.

También es que el desarrollador comprenda cada decisión técnica tomada durante el proyecto.

Claude deberá priorizar el aprendizaje del desarrollador por encima de la velocidad de implementación.