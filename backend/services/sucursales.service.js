import * as sucursalesModel from '../models/sucursales.model.js';

export async function getSucursales() {
  return sucursalesModel.findAll();
}

export async function getSucursalById(id) {
  return sucursalesModel.findById(id);
}

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function crearSucursal({ nombre }) {
  if (!nombre || !nombre.trim()) {
    throw crearError('El nombre es obligatorio', 400);
  }
  return sucursalesModel.create({ nombre });
}

export async function editarSucursal(id, { nombre, activo }) {
  const sucursal = await sucursalesModel.findById(id);
  if (!sucursal) {
    throw crearError('Sucursal no encontrada', 404);
  }
  if (nombre !== undefined && !nombre.trim()) {
    throw crearError('El nombre es obligatorio', 400);
  }
  return sucursalesModel.update(id, { nombre, activo });
}
