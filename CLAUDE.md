# CLAUDE.md

Instrucciones operativas para trabajar en este repo (KDesk).

## Procesos de desarrollo

Matías deja el backend y el frontend corriendo en dos consolas propias para ver los
cambios en tiempo real mientras se trabaja. **Nunca matar esos procesos** (ni con
`taskkill`, ni parando el puerto 4000 o el de Vite) para hacer pruebas rápidas.
Si hace falta probar algo end-to-end:

- Usar los servidores que ya están corriendo (pegarle a `http://localhost:4000` o
  al puerto de Vite que esté activo) en lugar de levantar una instancia propia.
- Si por algún motivo hay que levantar una instancia adicional para una prueba
  puntual, no tocar los procesos existentes del usuario al terminar.

## Permisos dentro del repo

Dentro de esta carpeta (KDesk, backend, frontend, database, docs, etc.) no hace
falta pedir autorización para leer, crear o modificar archivos, ni para correr
comandos. Avanzar directo. Solo se debe confirmar con el usuario si:

- Hace falta instalar una dependencia externa nueva no autorizada previamente.
- Hace falta leer o modificar algo fuera de este repositorio.
