# Instala el backend de KDesk como Tarea Programada de Windows: arranca
# solo al iniciar el sistema (sin necesidad de que haya una sesión de
# usuario abierta), corre en segundo plano sin consola, y Task Scheduler
# lo reinicia automáticamente si el proceso llega a caerse.
#
# Correr como Administrador:
#   powershell -ExecutionPolicy Bypass -File .\install-service.ps1

$ErrorActionPreference = 'Stop'

$tareaNombre  = 'KDesk Backend'
$rutaBackend  = Split-Path -Parent $PSScriptRoot
$rutaServer   = Join-Path $rutaBackend 'server.js'
$rutaLogs     = Join-Path $rutaBackend 'logs'
$rutaLog      = Join-Path $rutaLogs 'backend.log'
$rutaNode     = (Get-Command node).Source
$rutaWrapper  = Join-Path $PSScriptRoot 'run-backend.cmd'

if (-not (Test-Path $rutaLogs)) {
    New-Item -ItemType Directory -Path $rutaLogs | Out-Null
}

# node.exe no soporta redirigir stdout/stderr a un archivo por sí solo, así
# que necesitamos cmd.exe para hacer el ">>". Pero pasarle el comando como
# argumento de "cmd /c" es frágil: si hay más de un par de comillas en la
# línea, cmd.exe entra en un modo viejo de parseo que las rompe y el proceso
# muere al toque (esto es justo lo que pasó la primera vez: "función
# incorrecta" / exit code 1, sin nada en el log). Generar un .cmd y hacer
# que Task Scheduler lo ejecute directo evita el problema: cada línea del
# archivo se parsea normal, sin esa heurística.
$contenidoWrapper = @"
@echo off
cd /d "$rutaBackend"
"$rutaNode" "$rutaServer" >> "$rutaLog" 2>&1
"@
Set-Content -Path $rutaWrapper -Value $contenidoWrapper -Encoding ASCII

$accion = New-ScheduledTaskAction -Execute $rutaWrapper -WorkingDirectory $rutaBackend

$trigger = New-ScheduledTaskTrigger -AtStartup

# SYSTEM no necesita contraseña guardada (a diferencia de una cuenta de
# usuario) y tiene permisos de sobra para escuchar en el puerto 80 y
# acceder a los archivos del repo.
$principal = New-ScheduledTaskPrincipal -UserId 'NT AUTHORITY\SYSTEM' -LogonType ServiceAccount -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 999 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero)

if (Get-ScheduledTask -TaskName $tareaNombre -ErrorAction SilentlyContinue) {
    Write-Output "Ya existe la tarea '$tareaNombre', la reemplazo con esta configuración..."
    Unregister-ScheduledTask -TaskName $tareaNombre -Confirm:$false
}

Register-ScheduledTask -TaskName $tareaNombre `
    -Action $accion `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description 'Backend de KDesk (Express + Node). Arranca con el sistema, sirve la API y el build del frontend en el puerto configurado en .env (PORT).' `
    | Out-Null

Start-ScheduledTask -TaskName $tareaNombre

Start-Sleep -Seconds 2
Get-ScheduledTask -TaskName $tareaNombre | Get-ScheduledTaskInfo | Format-List TaskName, LastRunTime, LastTaskResult, NextRunTime

Write-Output ""
Write-Output "Listo. Comandos utiles:"
Write-Output "  Ver estado:    Get-ScheduledTask -TaskName '$tareaNombre' | Get-ScheduledTaskInfo"
Write-Output "  Ver logs:      Get-Content '$rutaLog' -Tail 50 -Wait"
Write-Output "  Detener:       Stop-ScheduledTask -TaskName '$tareaNombre'"
Write-Output "  Volver a iniciar: Start-ScheduledTask -TaskName '$tareaNombre'"
Write-Output "  Desinstalar:   Unregister-ScheduledTask -TaskName '$tareaNombre' -Confirm:`$false"
