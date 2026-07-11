# CODING_RULES.md

# KDesk

## Reglas de Desarrollo

Versión: 1.0

---

# Arquitectura

- Respetar la arquitectura definida en ARCHITECTURE.md.
- No crear nuevas carpetas sin autorización.
- No modificar la estructura del proyecto sin autorización.
- Mantener una única responsabilidad por archivo.

---

# Implementación

- Implementar únicamente la funcionalidad solicitada.
- No modificar archivos que no pertenezcan a la tarea actual.
- Evitar refactorizaciones innecesarias.
- Explicar el enfoque antes de implementar cambios importantes.
- Si existen varias alternativas técnicas, presentarlas y esperar una decisión.

---

# Código

- Priorizar código claro y mantenible.
- Evitar duplicación.
- Utilizar nombres descriptivos.
- Comentar únicamente cuando aporte valor.

---

# Frontend

- Toda comunicación HTTP deberá realizarse desde `services`.
- No mezclar lógica de negocio con componentes visuales.
- Matías deja el servidor de desarrollo (`npm run dev` del frontend)
  corriendo en su propia terminal para ver los cambios en vivo (HMR).
  Nunca matar ni reiniciar ese proceso al verificar cambios; si hace
  falta levantar un servidor para probar algo (screenshots, curl),
  usar un puerto/proceso aparte y no tocar el que ya está corriendo.

---

# Backend

- Routes: reciben peticiones.
- Controllers: procesan peticiones.
- Services: contienen la lógica de negocio.
- Models: acceso exclusivo a PostgreSQL mediante SQL.

---

# Base de Datos

- Utilizar SQL puro.
- No utilizar ORM.

---

# Dependencias

Se permite utilizar únicamente las dependencias definidas en STACK.md.

Para incorporar una nueva dependencia:

1. Explicar qué problema resuelve.
2. Justificar su incorporación.
3. Esperar autorización.

---

# Seguridad

- Nunca escribir credenciales en el código.
- Utilizar variables de entorno para toda información sensible.
- Mantener actualizado `.env.example`.
- Nunca subir `.env` al repositorio.

---

# Comunicación

- No asumir requisitos funcionales.
- Ante una duda, preguntar antes de implementar.
- Si existe una contradicción entre documentos, detener la implementación y consultar.

---

# Objetivo

Además de desarrollar KDesk, el proyecto busca que el desarrollador comprenda las decisiones técnicas adoptadas.

Priorizar siempre el aprendizaje, la simplicidad y la mantenibilidad.