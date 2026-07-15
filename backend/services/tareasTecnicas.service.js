import * as tareasModel from '../models/tareasTecnicas.model.js';
import * as ticketsModel from '../models/tickets.model.js';
import * as historialService from './historial.service.js';

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function crearTarea({ idTicket, descripcion, idUsuarioCreador }) {
  if (!descripcion || !descripcion.trim()) {
    throw crearError('La descripción de la tarea es obligatoria', 400);
  }

  const ticket = await ticketsModel.findById(idTicket);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  const tarea = await tareasModel.create({ idTicket, descripcion });

  await historialService.registrarEvento({
    idTicket,
    idUsuario: idUsuarioCreador,
    evento: 'TAREA_CREADA',
    detalle: `Ticket ${ticket.numero}: tarea creada (${descripcion})`,
  });

  return tarea;
}

export async function listarTareasDeTicket(idTicket) {
  const ticket = await ticketsModel.findById(idTicket);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  return tareasModel.findAllByTicket(idTicket);
}

export async function editarTarea({ idTarea, descripcion, idUsuarioQueEdita }) {
  if (!descripcion || !descripcion.trim()) {
    throw crearError('La descripción de la tarea es obligatoria', 400);
  }

  const tarea = await tareasModel.findById(idTarea);
  if (!tarea) {
    throw crearError('Tarea no encontrada', 404);
  }

  const ticket = await ticketsModel.findById(tarea.id_ticket);
  const tareaActualizada = await tareasModel.updateDescripcion(idTarea, descripcion);

  await historialService.registrarEvento({
    idTicket: tarea.id_ticket,
    idUsuario: idUsuarioQueEdita,
    evento: 'TAREA_EDITADA',
    detalle: `Ticket ${ticket.numero}: tarea editada (${descripcion})`,
  });

  return tareaActualizada;
}

export async function eliminarTarea({ idTarea, idUsuarioQueElimina }) {
  const tarea = await tareasModel.findById(idTarea);
  if (!tarea) {
    throw crearError('Tarea no encontrada', 404);
  }

  const ticket = await ticketsModel.findById(tarea.id_ticket);
  await tareasModel.deleteById(idTarea);

  await historialService.registrarEvento({
    idTicket: tarea.id_ticket,
    idUsuario: idUsuarioQueElimina,
    evento: 'TAREA_ELIMINADA',
    detalle: `Ticket ${ticket.numero}: tarea eliminada (${tarea.descripcion})`,
  });

  return tarea;
}

export async function completarTarea({ idTarea, idUsuarioQueCompleta }) {
  const tarea = await tareasModel.findById(idTarea);
  if (!tarea) {
    throw crearError('Tarea no encontrada', 404);
  }

  const ticket = await ticketsModel.findById(tarea.id_ticket);

  if (tarea.completada) {
    const tareaActualizada = await tareasModel.marcarPendiente(idTarea);

    await historialService.registrarEvento({
      idTicket: tarea.id_ticket,
      idUsuario: idUsuarioQueCompleta,
      evento: 'TAREA_REABIERTA',
      detalle: `Ticket ${ticket.numero}: tarea reabierta (${tarea.descripcion})`,
    });

    return tareaActualizada;
  }

  const tareaActualizada = await tareasModel.marcarCompletada(idTarea);

  await historialService.registrarEvento({
    idTicket: tarea.id_ticket,
    idUsuario: idUsuarioQueCompleta,
    evento: 'TAREA_COMPLETADA',
    detalle: `Ticket ${ticket.numero}: tarea completada (${tarea.descripcion})`,
  });

  return tareaActualizada;
}
