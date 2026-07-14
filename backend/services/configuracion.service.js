import * as configuracionModel from '../models/configuracion.model.js';

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function getConfiguracion() {
  return configuracionModel.obtener();
}

export async function actualizarDiasRetencion(dias) {
  if (!Number.isInteger(dias) || dias < 1) {
    throw crearError('Los días de retención deben ser un número entero mayor o igual a 1', 400);
  }
  return configuracionModel.actualizarDiasRetencion(dias);
}
