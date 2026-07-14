import * as configuracionService from '../services/configuracion.service.js';
import * as auditoriaService from '../services/auditoria.service.js';

const UN_DIA_EN_MS = 24 * 60 * 60 * 1000;

function msHastaProximaMedianoche() {
  const ahora = new Date();
  const proximaMedianoche = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 0, 0, 0, 0);
  return proximaMedianoche.getTime() - ahora.getTime();
}

async function ejecutarLimpiezaProgramada() {
  try {
    const configuracion = await configuracionService.getConfiguracion();
    const resultado = await auditoriaService.limpiarLogs({
      diasPreservar: configuracion.dias_retencion_logs,
      idUsuarioQueLimpia: null,
    });
    console.log(
      `Limpieza programada de logs: ${resultado.auditoriaEliminadas} de auditoría y ` +
        `${resultado.historialEliminados} de historial de tickets (preservando ${configuracion.dias_retencion_logs} días).`
    );
  } catch (error) {
    console.error('Error en la limpieza programada de logs:', error.message);
  }
}

export function programarLimpiezaNocturna() {
  setTimeout(function iniciarCicloDiario() {
    ejecutarLimpiezaProgramada();
    setInterval(ejecutarLimpiezaProgramada, UN_DIA_EN_MS);
  }, msHastaProximaMedianoche());
}
