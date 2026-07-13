import * as tiposTicketModel from '../models/tiposTicket.model.js';

export async function getTiposTicket() {
  return tiposTicketModel.findAll();
}

export async function getTipoTicketById(id) {
  return tiposTicketModel.findById(id);
}

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function crearTipoTicket({ nombre }) {
  if (!nombre || !nombre.trim()) {
    throw crearError('El nombre es obligatorio', 400);
  }
  return tiposTicketModel.create({ nombre });
}

export async function editarTipoTicket(id, { nombre, activo }) {
  const tipo = await tiposTicketModel.findById(id);
  if (!tipo) {
    throw crearError('Tipo de ticket no encontrado', 404);
  }
  if (nombre !== undefined && !nombre.trim()) {
    throw crearError('El nombre es obligatorio', 400);
  }
  return tiposTicketModel.update(id, { nombre, activo });
}
