import * as sectoresModel from '../models/sectores.model.js';

export async function getSectores() {
  return sectoresModel.findAll();
}

export async function getSectorById(id) {
  return sectoresModel.findById(id);
}
