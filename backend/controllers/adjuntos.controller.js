import * as adjuntosService from '../services/adjuntos.service.js';

export async function subirAdjuntoDeTicket(req, res) {
  try {
    const adjunto = await adjuntosService.agregarAdjuntoATicket({
      idTicket: req.params.idTicket,
      archivo: req.file,
      usuario: req.usuario,
    });
    res.status(201).json(adjunto);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo subir el adjunto' });
  }
}

export async function getAdjuntosDeTicket(req, res) {
  try {
    const adjuntos = await adjuntosService.listarAdjuntosDeTicket(req.params.idTicket, req.usuario);
    res.json(adjuntos);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudieron obtener los adjuntos' });
  }
}

export async function subirAdjuntoDeComentario(req, res) {
  try {
    const adjunto = await adjuntosService.agregarAdjuntoAComentario({
      idComentario: req.params.idComentario,
      archivo: req.file,
      usuario: req.usuario,
    });
    res.status(201).json(adjunto);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo subir el adjunto' });
  }
}

export async function getAdjuntosDeComentario(req, res) {
  try {
    const adjuntos = await adjuntosService.listarAdjuntosDeComentario(req.params.idComentario, req.usuario);
    res.json(adjuntos);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudieron obtener los adjuntos' });
  }
}

export async function subirAdjuntoDeTarea(req, res) {
  try {
    const adjunto = await adjuntosService.agregarAdjuntoATarea({
      idTarea: req.params.idTarea,
      archivo: req.file,
      usuario: req.usuario,
    });
    res.status(201).json(adjunto);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo subir el adjunto' });
  }
}

export async function getAdjuntosDeTarea(req, res) {
  try {
    const adjuntos = await adjuntosService.listarAdjuntosDeTarea(req.params.idTarea);
    res.json(adjuntos);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudieron obtener los adjuntos' });
  }
}

export async function eliminarAdjunto(req, res) {
  try {
    const adjunto = await adjuntosService.eliminarAdjunto({ idAdjunto: req.params.id, usuario: req.usuario });
    res.json(adjunto);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo eliminar el adjunto' });
  }
}

export async function descargarAdjunto(req, res) {
  try {
    const adjunto = await adjuntosService.obtenerAdjuntoParaDescarga(req.params.id, req.usuario);
    res.download(adjunto.ruta_archivo, adjunto.nombre_archivo);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo descargar el adjunto' });
  }
}
