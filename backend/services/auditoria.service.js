import * as auditoriaModel from '../models/auditoria.model.js';
import * as historialModel from '../models/historial.model.js';

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function registrarEvento({ idUsuario, accion, detalle }) {
  try {
    await auditoriaModel.create({ idUsuario, accion, detalle });
  } catch (error) {
    console.error('No se pudo registrar el evento de auditoría:', error.message);
  }
}

export async function listarAuditoria() {
  return auditoriaModel.findAll();
}

export async function limpiarLogs({ diasPreservar, idUsuarioQueLimpia }) {
  if (!Number.isInteger(diasPreservar) || diasPreservar < 1) {
    throw crearError('Los días a preservar deben ser un número entero mayor o igual a 1', 400);
  }

  const fechaCorte = new Date(Date.now() - diasPreservar * 24 * 60 * 60 * 1000);

  const auditoriaEliminadas = await auditoriaModel.deleteAnterioresA(fechaCorte);
  const historialEliminados = await historialModel.deleteAnterioresA(fechaCorte);

  await registrarEvento({
    idUsuario: idUsuarioQueLimpia,
    accion: 'LIMPIEZA_LOGS',
    detalle: `Limpieza de logs: preservando últimos ${diasPreservar} días (corte ${fechaCorte.toISOString()}). ` +
      `Eliminados ${auditoriaEliminadas} de auditoría y ${historialEliminados} de historial de tickets.`,
  });

  return { auditoriaEliminadas, historialEliminados, fechaCorte };
}
