import * as sectoresModel from '../models/sectores.model.js';

export async function getSectores() {
  return sectoresModel.findAll();
}

export async function getSectorById(id) {
  return sectoresModel.findById(id);
}

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function crearSector({ nombre }) {
  if (!nombre || !nombre.trim()) {
    throw crearError('El nombre es obligatorio', 400);
  }
  return sectoresModel.create({ nombre });
}

export async function editarSector(id, { nombre, activo }) {
  const sector = await sectoresModel.findById(id);
  if (!sector) {
    throw crearError('Sector no encontrado', 404);
  }
  if (nombre !== undefined && !nombre.trim()) {
    throw crearError('El nombre es obligatorio', 400);
  }
  return sectoresModel.update(id, { nombre, activo });
}
