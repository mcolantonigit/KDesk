# Saca la Tarea Programada del backend de KDesk. No borra logs ni el .env.
#
# Correr como Administrador:
#   powershell -ExecutionPolicy Bypass -File .\uninstall-service.ps1

$ErrorActionPreference = 'Stop'
$tareaNombre = 'KDesk Backend'

if (Get-ScheduledTask -TaskName $tareaNombre -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask -TaskName $tareaNombre -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $tareaNombre -Confirm:$false
    Write-Output "Tarea '$tareaNombre' eliminada."
} else {
    Write-Output "No existe la tarea '$tareaNombre', no hay nada que sacar."
}
