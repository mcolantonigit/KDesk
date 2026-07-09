import * as comentariosService from '../services/comentarios.service.js';

export async function crearComentario(req, res) {
  try {
    const { contenido } = req.body;
    const comentario = await comentariosService.crearComentario({
      idTicket: req.params.idTicket,
      contenido,
      usuario: req.usuario,
    });
    res.status(201).json(comentario);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo crear el comentario' });
  }
}

export async function getComentarios(req, res) {
  try {
    const comentarios = await comentariosService.listarComentariosDeTicket(req.params.idTicket, req.usuario);
    res.json(comentarios);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudieron obtener los comentarios' });
  }
}

export async function eliminarComentario(req, res) {
  try {
    const comentario = await comentariosService.eliminarComentario({
      idComentario: req.params.id,
      usuario: req.usuario,
    });
    res.json(comentario);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo eliminar el comentario' });
  }
}
