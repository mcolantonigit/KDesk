import * as estadosModel from '../models/estados.model.js';

export async function getEstados() {
  return estadosModel.findAll();
}

export async function getEstadoById(id) {
  return estadosModel.findById(id);
}
