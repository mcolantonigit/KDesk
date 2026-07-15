import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const CARPETA_BACKUPS = 'backups/';

function rutaBinario(nombre) {
  const carpeta = process.env.PG_BIN_DIR;
  return carpeta ? path.join(carpeta, `${nombre}.exe`) : nombre;
}

function ejecutar(nombreBinario, args) {
  return new Promise((resolve, reject) => {
    const proceso = spawn(rutaBinario(nombreBinario), args, {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD },
    });

    let salidaError = '';
    proceso.stderr.on('data', (chunk) => {
      salidaError += chunk.toString();
    });

    proceso.on('error', (error) => {
      reject(new Error(`No se pudo ejecutar ${nombreBinario}: ${error.message}`));
    });

    proceso.on('close', (codigo) => {
      if (codigo === 0) {
        resolve();
      } else {
        reject(new Error(`${nombreBinario} terminó con error: ${salidaError.trim() || `código ${codigo}`}`));
      }
    });
  });
}

function argumentosConexion() {
  return ['-h', process.env.DB_HOST, '-p', process.env.DB_PORT, '-U', process.env.DB_USER, '-d', process.env.DB_NAME];
}

export function carpetaBackups() {
  if (!fs.existsSync(CARPETA_BACKUPS)) {
    fs.mkdirSync(CARPETA_BACKUPS, { recursive: true });
  }
  return CARPETA_BACKUPS;
}

export function nombreArchivoBackup(prefijo) {
  const ahora = new Date();
  const parte = (n) => String(n).padStart(2, '0');
  const marca =
    `${ahora.getFullYear()}-${parte(ahora.getMonth() + 1)}-${parte(ahora.getDate())}` +
    `_${parte(ahora.getHours())}-${parte(ahora.getMinutes())}-${parte(ahora.getSeconds())}`;
  return `${prefijo}_${marca}.sql`;
}

export async function generarBackup(nombreArchivo) {
  const rutaCompleta = path.join(carpetaBackups(), nombreArchivo);
  await ejecutar('pg_dump', [...argumentosConexion(), '--format=plain', '--clean', '--if-exists', '-f', rutaCompleta]);
  return rutaCompleta;
}

export async function restaurarBackup(rutaArchivo) {
  await ejecutar('psql', [...argumentosConexion(), '-v', 'ON_ERROR_STOP=1', '-f', rutaArchivo]);
}
