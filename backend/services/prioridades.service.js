import * as prioridadesModel from '../models/prioridades.model.js';

export async function getPrioridades() {
  return prioridadesModel.findAll();
}

export async function getPrioridadById(id) {
  return prioridadesModel.findById(id);
}

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function crearPrioridad({ nombre }) {
  if (!nombre || !nombre.trim()) {
    throw crearError('El nombre es obligatorio', 400);
  }
  return prioridadesModel.create({ nombre });
}

export async function editarPrioridad(id, { nombre, activo }) {
  const prioridad = await prioridadesModel.findById(id);
  if (!prioridad) {
    throw crearError('Prioridad no encontrada', 404);
  }
  if (nombre !== undefined && !nombre.trim()) {
    throw crearError('El nombre es obligatorio', 400);
  }
  return prioridadesModel.update(id, { nombre, activo });
}
