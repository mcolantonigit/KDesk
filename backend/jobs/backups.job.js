import * as backupsService from '../services/backups.service.js';
import * as backupUtil from '../utils/backup.util.js';

const INTERVALO_CHEQUEO_MS = 60 * 1000;

let ultimaEjecucion = null;

function marcaActual(fecha) {
  const parte = (n) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${parte(fecha.getMonth() + 1)}-${parte(fecha.getDate())} ${parte(fecha.getHours())}:${parte(fecha.getMinutes())}`;
}

async function chequearYEjecutar() {
  try {
    const configuracion = await backupsService.getConfiguracionBackup();
    if (!configuracion.backupAutomaticoActivo) return;

    const dias = configuracion.backupDias
      .split(',')
      .filter((valor) => valor !== '')
      .map(Number);
    if (dias.length === 0) return;

    const ahora = new Date();
    if (!dias.includes(ahora.getDay())) return;

    const [horaConfig, minutoConfig] = configuracion.backupHora.split(':').map(Number);
    if (ahora.getHours() !== horaConfig || ahora.getMinutes() !== minutoConfig) return;

    const marca = marcaActual(ahora);
    if (marca === ultimaEjecucion) return;
    ultimaEjecucion = marca;

    const nombreArchivo = backupUtil.nombreArchivoBackup('automatico');
    await backupUtil.generarBackup(nombreArchivo);
    console.log(`Backup automático generado: ${nombreArchivo}`);
  } catch (error) {
    console.error('Error en el backup automático programado:', error.message);
  }
}

// En desarrollo (BACKUP_AUTOMATICO=off en el .env) no se programa nunca, aunque
// la configuración de la base, clonada de producción, lo tenga activado.
export function programarBackupAutomatico() {
  if (process.env.BACKUP_AUTOMATICO === 'off') {
    console.log('Backup automático desactivado por BACKUP_AUTOMATICO=off');
    return;
  }
  setInterval(chequearYEjecutar, INTERVALO_CHEQUEO_MS);
}
