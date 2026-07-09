import * as historialModel from '../models/historial.model.js';

export async function registrarEvento({ idTicket, idUsuario, evento, detalle }) {
  return historialModel.create({ idTicket, idUsuario, evento, detalle });
}

export async function obtenerHistorialDeTicket(idTicket) {
  return historialModel.findAllByTicket(idTicket);
}
