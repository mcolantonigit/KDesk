import { verificarToken } from '../utils/jwt.util.js';
import * as rolesService from '../services/roles.service.js';

export function requiereAutenticacion(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    req.usuario = verificarToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

export async function requiereRolTecnico(req, res, next) {
  const esTecnico = await rolesService.esRolTecnicoOAdministrador(req.usuario.idRol);
  if (!esTecnico) {
    return res.status(403).json({ message: 'Acción permitida solo para técnicos' });
  }
  next();
}
