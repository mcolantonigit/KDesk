import * as kadiService from '../services/kadi.service.js';

export async function getEstado(req, res) {
  try {
    res.json({ habilitada: await kadiService.estaHabilitada(req.usuario.id) });
  } catch (error) {
    res.status(500).json({ message: 'No se pudo consultar a Kadi' });
  }
}

export async function enviarMensaje(req, res) {
  try {
    const respuesta = await kadiService.conversar({ idUsuario: req.usuario.id, mensajes: req.body.mensajes });
    res.json(respuesta);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Kadi no pudo responder' });
  }
}
