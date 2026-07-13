import * as rolesModel from '../models/roles.model.js';

export async function getRoles() {
  return rolesModel.findAll();
}

export async function getRoleById(id) {
  return rolesModel.findById(id);
}

export async function esRolTecnicoOAdministrador(idRol) {
  const rol = await rolesModel.findById(idRol);
  return rol?.nombre === 'tecnico' || rol?.nombre === 'administrador';
}

export async function esRolAdministrador(idRol) {
  const rol = await rolesModel.findById(idRol);
  return rol?.nombre === 'administrador';
}
