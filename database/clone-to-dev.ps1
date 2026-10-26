# Clona la base de producción en una base nueva "kdesk_dev" dentro del
# mismo servidor Postgres. Solo LEE de la base original (pg_dump); la
# única que se crea/escribe es kdesk_dev. Si kdesk_dev ya existe, aborta.
#
#   powershell -ExecutionPolicy Bypass -File .\clone-to-dev.ps1 -DbHost <ip-o-nombre-del-server>

param(
    [Parameter(Mandatory = $true)][string]$DbHost,
    [int]$Port = 5432,
    [string]$Usuario = 'postgres',
    [string]$Origen = 'kdesk',
    [string]$Destino = 'kdesk_dev',
    [string]$PgBin = 'C:\Program Files\PostgreSQL\18\bin'
)

$ErrorActionPreference = 'Stop'

# Los .exe no cortan el script cuando fallan: hay que mirar el código de
# salida después de cada uno.
function Verificar([string]$paso) {
    if ($LASTEXITCODE -ne 0) { throw "Falló: $paso (código $LASTEXITCODE)" }
}

$clave = Read-Host "Contraseña de '$Usuario' en $DbHost" -AsSecureString
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($clave))

$dump = Join-Path $env:TEMP "$Origen-clone.dump"

try {
    $psql = Join-Path $PgBin 'psql.exe'
    $existe = & $psql -h $DbHost -p $Port -U $Usuario -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$Destino'"
    Verificar 'consultar si la base destino existe'
    if ($existe -eq '1') { throw "La base '$Destino' ya existe, no la piso. Borrala a mano si querés rehacerla." }

    & (Join-Path $PgBin 'pg_dump.exe') -h $DbHost -p $Port -U $Usuario -Fc --no-owner -f $dump $Origen
    Verificar "pg_dump de '$Origen'"

    & $psql -h $DbHost -p $Port -U $Usuario -d postgres -c "CREATE DATABASE $Destino"
    Verificar "crear '$Destino'"

    & (Join-Path $PgBin 'pg_restore.exe') -h $DbHost -p $Port -U $Usuario --no-owner -d $Destino $dump
    Verificar "pg_restore en '$Destino'"

    Write-Output "Listo: '$Destino' creada en $DbHost a partir de '$Origen'."
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    Remove-Item $dump -ErrorAction SilentlyContinue
}
