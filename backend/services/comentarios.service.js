import * as comentariosModel from '../models/comentarios.model.js';
import * as ticketsModel from '../models/tickets.model.js';
import * as ticketsService from './tickets.service.js';
import * as rolesService from './roles.service.js';
import * as historialService from './historial.service.js';

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function crearComentario({ idTicket, contenido, usuario }) {
  if (!contenido || !contenido.trim()) {
    throw crearError('El contenido del comentario es obligatorio', 400);
  }

  const ticket = await ticketsService.obtenerTicketPorId(idTicket, usuario);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  const comentario = await comentariosModel.create({ idTicket, idAutor: usuario.id, contenido });

  await historialService.registrarEvento({
    idTicket,
    idUsuario: usuario.id,
    evento: 'COMENTARIO',
    detalle: `Ticket ${ticket.numero}: comentario agregado`,
  });

  return comentario;
}

export async function listarComentariosDeTicket(idTicket, usuario) {
  const ticket = await ticketsService.obtenerTicketPorId(idTicket, usuario);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  return comentariosModel.findAllByTicket(idTicket);
}

export async function eliminarComentario({ idComentario, usuario }) {
  const comentario = await comentariosModel.findById(idComentario);
  if (!comentario) {
    throw crearError('Comentario no encontrado', 404);
  }
  if (comentario.eliminado) {
    throw crearError('El comentario ya fue eliminado', 400);
  }

  const esAutor = comentario.id_autor === usuario.id;
  const esTecnico = await rolesService.esRolTecnicoOAdministrador(usuario.idRol);
  if (!esAutor && !esTecnico) {
    throw crearError('No tiene permisos para eliminar este comentario', 403);
  }

  const comentarioEliminado = await comentariosModel.softDelete(idComentario);

  const ticket = await ticketsModel.findById(comentario.id_ticket);

  await historialService.registrarEvento({
    idTicket: comentario.id_ticket,
    idUsuario: usuario.id,
    evento: 'ELIMINACION_COMENTARIO',
    detalle: `Ticket ${ticket.numero}: comentario eliminado`,
  });

  return comentarioEliminado;
}
