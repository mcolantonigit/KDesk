import * as rolesModel from '../models/roles.model.js';

export async function getRoles() {
  return rolesModel.findAll();
}

export async function getRoleById(id) {
  return rolesModel.findById(id);
}
