import { verificarToken } from '../utils/jwt.util.js';

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
