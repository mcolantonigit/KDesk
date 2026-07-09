import fs from 'fs/promises';
import * as adjuntosModel from '../models/adjuntos.model.js';
import * as ticketsModel from '../models/tickets.model.js';
import * as comentariosModel from '../models/comentarios.model.js';
import * as tareasModel from '../models/tareasTecnicas.model.js';
import * as ticketsService from './tickets.service.js';
import * as rolesService from './roles.service.js';
import * as historialService from './historial.service.js';

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function resolverIdTicket(adjunto) {
  if (adjunto.id_ticket) {
    return adjunto.id_ticket;
  }
  if (adjunto.id_comentario) {
    const comentario = await comentariosModel.findById(adjunto.id_comentario);
    return comentario.id_ticket;
  }
  const tarea = await tareasModel.findById(adjunto.id_tarea);
  return tarea.id_ticket;
}

async function registrarAdjunto({ idTicket, idComentario, idTarea, archivo, idUsuarioSubio, ticket }) {
  const adjunto = await adjuntosModel.create({
    idTicket,
    idComentario,
    idTarea,
    nombreArchivo: archivo.originalname,
    rutaArchivo: archivo.path,
    tipoArchivo: archivo.mimetype,
    tamanoBytes: archivo.size,
    idUsuarioSubio,
  });

  await historialService.registrarEvento({
    idTicket: ticket.id,
    idUsuario: idUsuarioSubio,
    evento: 'ADJUNTO_AGREGADO',
    detalle: `Ticket ${ticket.numero}: adjunto agregado (${archivo.originalname})`,
  });

  return adjunto;
}

export async function agregarAdjuntoATicket({ idTicket, archivo, usuario }) {
  if (!archivo) {
    throw crearError('Debe adjuntar un archivo', 400);
  }

  const ticket = await ticketsService.obtenerTicketPorId(idTicket, usuario);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  return registrarAdjunto({ idTicket, idComentario: null, idTarea: null, archivo, idUsuarioSubio: usuario.id, ticket });
}

export async function agregarAdjuntoAComentario({ idComentario, archivo, usuario }) {
  if (!archivo) {
    throw crearError('Debe adjuntar un archivo', 400);
  }

  const comentario = await comentariosModel.findById(idComentario);
  if (!comentario) {
    throw crearError('Comentario no encontrado', 404);
  }

  const ticket = await ticketsService.obtenerTicketPorId(comentario.id_ticket, usuario);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  return registrarAdjunto({ idTicket: null, idComentario, idTarea: null, archivo, idUsuarioSubio: usuario.id, ticket });
}

export async function agregarAdjuntoATarea({ idTarea, archivo, usuario }) {
  if (!archivo) {
    throw crearError('Debe adjuntar un archivo', 400);
  }

  const tarea = await tareasModel.findById(idTarea);
  if (!tarea) {
    throw crearError('Tarea no encontrada', 404);
  }

  const ticket = await ticketsModel.findById(tarea.id_ticket);

  return registrarAdjunto({ idTicket: null, idComentario: null, idTarea, archivo, idUsuarioSubio: usuario.id, ticket });
}

export async function listarAdjuntosDeTicket(idTicket, usuario) {
  const ticket = await ticketsService.obtenerTicketPorId(idTicket, usuario);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }
  return adjuntosModel.findAllByTicket(idTicket);
}

export async function listarAdjuntosDeComentario(idComentario, usuario) {
  const comentario = await comentariosModel.findById(idComentario);
  if (!comentario) {
    throw crearError('Comentario no encontrado', 404);
  }
  await ticketsService.obtenerTicketPorId(comentario.id_ticket, usuario);
  return adjuntosModel.findAllByComentario(idComentario);
}

export async function listarAdjuntosDeTarea(idTarea) {
  const tarea = await tareasModel.findById(idTarea);
  if (!tarea) {
    throw crearError('Tarea no encontrada', 404);
  }
  return adjuntosModel.findAllByTarea(idTarea);
}

export async function eliminarAdjunto({ idAdjunto, usuario }) {
  const adjunto = await adjuntosModel.findById(idAdjunto);
  if (!adjunto) {
    throw crearError('Adjunto no encontrado', 404);
  }

  const esAutor = adjunto.id_usuario_subio === usuario.id;
  const esTecnico = await rolesService.esRolTecnicoOAdministrador(usuario.idRol);
  if (!esAutor && !esTecnico) {
    throw crearError('No tiene permisos para eliminar este adjunto', 403);
  }

  const idTicket = await resolverIdTicket(adjunto);
  const ticket = await ticketsModel.findById(idTicket);

  await fs.unlink(adjunto.ruta_archivo).catch(() => {});

  const adjuntoEliminado = await adjuntosModel.deleteById(idAdjunto);

  await historialService.registrarEvento({
    idTicket,
    idUsuario: usuario.id,
    evento: 'ADJUNTO_ELIMINADO',
    detalle: `Ticket ${ticket.numero}: adjunto eliminado (${adjunto.nombre_archivo})`,
  });

  return adjuntoEliminado;
}

export async function obtenerAdjuntoParaDescarga(idAdjunto, usuario) {
  const adjunto = await adjuntosModel.findById(idAdjunto);
  if (!adjunto) {
    throw crearError('Adjunto no encontrado', 404);
  }

  const idTicket = await resolverIdTicket(adjunto);
  const ticket = await ticketsService.obtenerTicketPorId(idTicket, usuario);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  return adjunto;
}
