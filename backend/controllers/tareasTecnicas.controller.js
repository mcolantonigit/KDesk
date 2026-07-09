import * as tareasService from '../services/tareasTecnicas.service.js';

export async function crearTarea(req, res) {
  try {
    const { descripcion } = req.body;
    const tarea = await tareasService.crearTarea({
      idTicket: req.params.idTicket,
      descripcion,
      idUsuarioCreador: req.usuario.id,
    });
    res.status(201).json(tarea);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo crear la tarea' });
  }
}

export async function getTareas(req, res) {
  try {
    const tareas = await tareasService.listarTareasDeTicket(req.params.idTicket);
    res.json(tareas);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudieron obtener las tareas' });
  }
}

export async function completarTarea(req, res) {
  try {
    const tarea = await tareasService.completarTarea({
      idTarea: req.params.id,
      idUsuarioQueCompleta: req.usuario.id,
    });
    res.json(tarea);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo completar la tarea' });
  }
}
