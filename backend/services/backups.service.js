import fs from 'fs';
import path from 'path';
import * as backupUtil from '../utils/backup.util.js';
import * as configuracionModel from '../models/configuracion.model.js';
import * as auditoriaService from './auditoria.service.js';

const DIAS_VALIDOS = [0, 1, 2, 3, 4, 5, 6];

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

function validarRutaBackupExistente(nombreArchivo) {
  const nombreSeguro = path.basename(nombreArchivo);
  if (nombreSeguro !== nombreArchivo || !nombreArchivo.endsWith('.sql')) {
    throw crearError('Nombre de archivo inválido', 400);
  }

  const rutaCompleta = path.join(backupUtil.carpetaBackups(), nombreSeguro);
  if (!fs.existsSync(rutaCompleta)) {
    throw crearError('El backup indicado no existe', 404);
  }

  return rutaCompleta;
}

export async function generarBackupManual(idUsuario) {
  const nombreArchivo = backupUtil.nombreArchivoBackup('manual');
  await backupUtil.generarBackup(nombreArchivo);

  await auditoriaService.registrarEvento({
    idUsuario,
    accion: 'BACKUP_MANUAL',
    detalle: `Backup manual generado (${nombreArchivo})`,
  });

  return { nombreArchivo };
}

export async function listarBackups() {
  const carpeta = backupUtil.carpetaBackups();
  const archivos = fs.readdirSync(carpeta).filter((nombre) => nombre.endsWith('.sql'));

  return archivos
    .map((nombreArchivo) => {
      const stats = fs.statSync(path.join(carpeta, nombreArchivo));
      return { nombreArchivo, tamanoBytes: stats.size, fecha: stats.mtime };
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

export function obtenerRutaParaDescarga(nombreArchivo) {
  return validarRutaBackupExistente(nombreArchivo);
}

export async function restaurarDesdeBackupExistente({ nombreArchivo, idUsuario }) {
  const rutaCompleta = validarRutaBackupExistente(nombreArchivo);

  const nombreSeguridad = backupUtil.nombreArchivoBackup('pre-restauracion');
  await backupUtil.generarBackup(nombreSeguridad);

  await backupUtil.restaurarBackup(rutaCompleta);

  await auditoriaService.registrarEvento({
    idUsuario,
    accion: 'RESTAURACION_BACKUP',
    detalle: `Restauración desde ${nombreArchivo} (backup de seguridad previo: ${nombreSeguridad})`,
  });
}

export async function restaurarDesdeArchivoSubido({ rutaTemporal, nombreOriginal, idUsuario }) {
  try {
    const nombreSeguridad = backupUtil.nombreArchivoBackup('pre-restauracion');
    await backupUtil.generarBackup(nombreSeguridad);

    await backupUtil.restaurarBackup(rutaTemporal);

    await auditoriaService.registrarEvento({
      idUsuario,
      accion: 'RESTAURACION_BACKUP',
      detalle: `Restauración desde archivo subido (${nombreOriginal}; backup de seguridad previo: ${nombreSeguridad})`,
    });
  } finally {
    fs.unlink(rutaTemporal, () => {});
  }
}

export async function getConfiguracionBackup() {
  const configuracion = await configuracionModel.obtener();
  return {
    backupAutomaticoActivo: configuracion.backup_automatico_activo,
    backupDias: configuracion.backup_dias,
    backupHora: configuracion.backup_hora,
  };
}

export async function actualizarConfiguracionBackup({ activo, dias, hora }) {
  const listaDias = (dias ?? '')
    .split(',')
    .filter((valor) => valor !== '')
    .map(Number);

  if (listaDias.some((dia) => !DIAS_VALIDOS.includes(dia))) {
    throw crearError('Los días seleccionados no son válidos', 400);
  }
  if (!/^\d{2}:\d{2}$/.test(hora ?? '')) {
    throw crearError('La hora debe tener el formato HH:mm', 400);
  }

  const configuracion = await configuracionModel.actualizarBackupAutomatico({
    activo: Boolean(activo),
    dias: listaDias.join(','),
    hora: `${hora}:00`,
  });

  return {
    backupAutomaticoActivo: configuracion.backup_automatico_activo,
    backupDias: configuracion.backup_dias,
    backupHora: configuracion.backup_hora,
  };
}
