import * as notificacionesService from '../services/notificaciones.service.js';

export async function getNotificaciones(req, res) {
  try {
    const resultado = await notificacionesService.obtenerNotificaciones({
      usuario: req.usuario,
      despuesDe: req.query.despuesDe,
      limite: req.query.limite,
    });
    res.json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudieron obtener las notificaciones' });
  }
}
