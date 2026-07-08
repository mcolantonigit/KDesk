import * as sucursalesModel from '../models/sucursales.model.js';

export async function getSucursales() {
  return sucursalesModel.findAll();
}

export async function getSucursalById(id) {
  return sucursalesModel.findById(id);
}
