import * as estadosModel from '../models/estados.model.js';

export async function getEstados() {
  return estadosModel.findAll();
}

export async function getEstadoById(id) {
  return estadosModel.findById(id);
}

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function crearEstado({ nombre }) {
  if (!nombre || !nombre.trim()) {
    throw crearError('El nombre es obligatorio', 400);
  }
  return estadosModel.create({ nombre });
}

export async function editarEstado(id, { nombre, activo }) {
  const estado = await estadosModel.findById(id);
  if (!estado) {
    throw crearError('Estado no encontrado', 404);
  }
  if (nombre !== undefined && !nombre.trim()) {
    throw crearError('El nombre es obligatorio', 400);
  }
  return estadosModel.update(id, { nombre, activo });
}
