import { verificarToken } from '../utils/jwt.util.js';
import { loginConPasswordPermitido } from '../utils/origen.util.js';
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

// Login, registro, activación y recuperación de contraseña: según LOGIN_PASSWORD,
// desde internet (o en todos lados) solo se entra con Microsoft 365.
export function requiereLoginConPassword(req, res, next) {
  if (!loginConPasswordPermitido(req)) {
    return res.status(403).json({ message: 'Entrá con tu cuenta de Microsoft 365 de Kalop' });
  }
  next();
}

export async function requiereRolTecnico(req, res, next) {
  const esTecnico = await rolesService.esRolTecnicoOAdministrador(req.usuario.idRol);
  if (!esTecnico) {
    return res.status(403).json({ message: 'Acción permitida solo para técnicos' });
  }
  next();
}

export async function requiereRolAdministrador(req, res, next) {
  const esAdministrador = await rolesService.esRolAdministrador(req.usuario.idRol);
  if (!esAdministrador) {
    return res.status(403).json({ message: 'Acción permitida solo para administradores' });
  }
  next();
}
