import * as rolesService from '../services/roles.service.js';

export async function getRoles(req, res) {
  try {
    const roles = await rolesService.getRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener los roles' });
  }
}

export async function getRoleById(req, res) {
  try {
    const rol = await rolesService.getRoleById(req.params.id);
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    res.json(rol);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener el rol' });
  }
}
