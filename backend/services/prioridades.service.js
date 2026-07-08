import * as prioridadesModel from '../models/prioridades.model.js';

export async function getPrioridades() {
  return prioridadesModel.findAll();
}

export async function getPrioridadById(id) {
  return prioridadesModel.findById(id);
}
