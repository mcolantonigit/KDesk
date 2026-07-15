1. Prerrequisitos en la VM
Node.js (misma versión mayor que usás acá — LTS actual). Bajalo de nodejs.org, instalador .msi.
PostgreSQL (mismo instalador que ya usaste acá, versión 18 para que coincida). Instalalo con un usuario/contraseña que vos definas para producción — no reutilices la del dev.
Git (opcional, pero recomendado para poder hacer git pull después en vez de copiar archivos a mano).
2. Llevar el código
Con Git instalado en la VM:


cd C:\
git clone <url-de-tu-repo> KDesk
cd KDesk
(Si no querés usar Git ahí, copiás la carpeta entera del repo por red/USB, excepto node_modules, .env, backend/uploads/* y backend/backups/*.)

3. Base de datos
En la VM, con psql:


& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE kdesk;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d kdesk -f database\schema.sql
Si querés migrar los datos que ya tenés acá: generás un backup con la pantalla de Backups (o pg_dump directo), copiás el .sql a la VM, y ahí psql -U postgres -d kdesk -f ese_archivo.sql.

4. Configurar backend/.env (nuevo, específico de la VM)
Copiá backend/.env.example a backend/.env y completá con los valores de producción: DB_PASSWORD (el que pusiste en el paso 1), JWT_SECRET (uno nuevo y aleatorio, no el de dev), SMTP_* (mismas credenciales de Office 365), FRONTEND_URL (la IP o nombre de la VM en tu red, ej. http://192.168.x.x:4000 — ya no hace falta puerto 5173 porque Express sirve todo), PG_BIN_DIR (ruta al bin de Postgres en la VM), COOKIE_SECURE=false (por ser intranet sin TLS, como charlamos).

5. Instalar dependencias y compilar

cd backend; npm install --omit=dev
cd ..\frontend; npm install; npm run build
Esto genera frontend/dist, que es lo que Express va a servir.

6. Probar a mano antes de automatizar nada

cd ..\backend
node server.js
Entrá desde un navegador a http://<ip-de-la-vm>:4000 y probá login, crear un ticket, etc. Si anda, cortás con Ctrl+C y pasamos al paso 7 (dejarlo corriendo siempre).

7. Que corra como servicio de Windows (con NSSM)
Bajás NSSM (no es dependencia del proyecto, es una herramienta standalone para Windows), y:


nssm install KDeskBackend "C:\Program Files\nodejs\node.exe" "C:\KDesk\backend\server.js"
nssm set KDeskBackend AppDirectory "C:\KDesk\backend"
nssm start KDeskBackend
Así sobrevive a reinicios de la VM sin que quede una consola abierta.

8. Firewall

New-NetFirewallRule -DisplayName "KDesk" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
9. Verificar
Entrar desde otra PC de la red a http://<ip-vm>:4000, probar login, crear ticket, mandar un mail (recuperar contraseña), y una vez logueado probar la pantalla de Backups.