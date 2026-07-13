import * as ticketsModel from '../models/tickets.model.js';
import * as usuariosModel from '../models/usuarios.model.js';
import * as sectoresModel from '../models/sectores.model.js';
import * as estadosModel from '../models/estados.model.js';
import * as prioridadesModel from '../models/prioridades.model.js';
import * as comentariosModel from '../models/comentarios.model.js';
import * as rolesService from './roles.service.js';
import * as auditoriaService from './auditoria.service.js';
import * as historialService from './historial.service.js';

const ESTADO_INICIAL = 'Pendiente';
const ESTADO_CERRADO = 'Cerrado';
const TITULO_LONGITUD_MAXIMA = 35;

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function crearTicket({ idUsuarioCreador, idTipo, idPrioridadSugerida, titulo, descripcion }) {
  if (!titulo || !titulo.trim()) {
    throw crearError('El título es obligatorio', 400);
  }
  if (titulo.length > TITULO_LONGITUD_MAXIMA) {
    throw crearError(`El título no puede superar los ${TITULO_LONGITUD_MAXIMA} caracteres`, 400);
  }
  if (!descripcion || !descripcion.trim()) {
    throw crearError('La descripción es obligatoria', 400);
  }

  const usuario = await usuariosModel.findById(idUsuarioCreador);
  const sector = await sectoresModel.findById(usuario.id_sector);
  const estadoInicial = await estadosModel.findByNombre(ESTADO_INICIAL);

  const nombreDescriptivo = `${sector.nombre} - ${usuario.nombre} ${usuario.apellido} - ${titulo}`;

  const ticket = await ticketsModel.create({
    titulo,
    descripcion,
    nombreDescriptivo,
    idTipo,
    idPrioridadSugerida,
    idEstado: estadoInicial.id,
    idUsuarioCreador,
    idSucursal: usuario.id_sucursal,
    idSector: usuario.id_sector,
  });

  await auditoriaService.registrarEvento({
    idUsuario: idUsuarioCreador,
    accion: 'CREACION_TICKET',
    detalle: `Creación de ticket ${ticket.numero} (${ticket.titulo})`,
  });

  await historialService.registrarEvento({
    idTicket: ticket.id,
    idUsuario: idUsuarioCreador,
    evento: 'CREACION',
    detalle: `Ticket ${ticket.numero} creado`,
  });

  return ticket;
}

export async function listarTickets(usuario) {
  const esTecnico = await rolesService.esRolTecnicoOAdministrador(usuario.idRol);
  if (esTecnico) {
    return ticketsModel.findAll();
  }
  return ticketsModel.findAllByUsuarioCreador(usuario.id);
}

export async function obtenerTicketPorId(id, usuario) {
  const ticket = await ticketsModel.findById(id);
  if (!ticket) {
    return null;
  }

  const esTecnico = await rolesService.esRolTecnicoOAdministrador(usuario.idRol);
  if (!esTecnico && ticket.id_usuario_creador !== usuario.id) {
    throw crearError('No tiene acceso a este ticket', 403);
  }

  return ticket;
}

export async function cambiarEstado({ idTicket, idEstado, idUsuarioQueCambia }) {
  const ticket = await ticketsModel.findById(idTicket);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  const estado = await estadosModel.findById(idEstado);
  if (!estado) {
    throw crearError('Estado inválido', 400);
  }

  const ticketActualizado = await ticketsModel.updateEstado(idTicket, idEstado);

  await auditoriaService.registrarEvento({
    idUsuario: idUsuarioQueCambia,
    accion: 'CAMBIO_ESTADO',
    detalle: `Ticket ${ticket.numero}: estado -> ${estado.nombre}`,
  });

  await historialService.registrarEvento({
    idTicket,
    idUsuario: idUsuarioQueCambia,
    evento: 'CAMBIO_ESTADO',
    detalle: `Ticket ${ticket.numero}: estado -> ${estado.nombre}`,
  });

  return ticketActualizado;
}

export async function cambiarPrioridad({ idTicket, idPrioridad, idUsuarioQueCambia }) {
  const ticket = await ticketsModel.findById(idTicket);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  const prioridad = await prioridadesModel.findById(idPrioridad);
  if (!prioridad) {
    throw crearError('Prioridad inválida', 400);
  }

  const ticketActualizado = await ticketsModel.updatePrioridad(idTicket, idPrioridad);

  await auditoriaService.registrarEvento({
    idUsuario: idUsuarioQueCambia,
    accion: 'CAMBIO_PRIORIDAD',
    detalle: `Ticket ${ticket.numero}: prioridad -> ${prioridad.nombre}`,
  });

  await historialService.registrarEvento({
    idTicket,
    idUsuario: idUsuarioQueCambia,
    evento: 'CAMBIO_PRIORIDAD',
    detalle: `Ticket ${ticket.numero}: prioridad -> ${prioridad.nombre}`,
  });

  return ticketActualizado;
}

export async function cerrarTicket({ idTicket, comentario, usuario }) {
  if (!comentario || !comentario.trim()) {
    throw crearError('El comentario de cierre es obligatorio', 400);
  }

  const ticket = await ticketsModel.findById(idTicket);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  const esCreador = ticket.id_usuario_creador === usuario.id;
  const esTecnico = await rolesService.esRolTecnicoOAdministrador(usuario.idRol);
  if (!esCreador && !esTecnico) {
    throw crearError('No tiene permisos para cerrar este ticket', 403);
  }

  const estadoCerrado = await estadosModel.findByNombre(ESTADO_CERRADO);
  if (ticket.id_estado === estadoCerrado.id) {
    throw crearError('El ticket ya está cerrado', 400);
  }

  await comentariosModel.create({ idTicket, idAutor: usuario.id, contenido: comentario });

  const ticketCerrado = await ticketsModel.cerrar(idTicket, estadoCerrado.id);

  await auditoriaService.registrarEvento({
    idUsuario: usuario.id,
    accion: 'CIERRE_TICKET',
    detalle: `Ticket ${ticket.numero}: cerrado`,
  });

  await historialService.registrarEvento({
    idTicket,
    idUsuario: usuario.id,
    evento: 'CIERRE',
    detalle: `Ticket ${ticket.numero}: cerrado`,
  });

  return ticketCerrado;
}

export async function asignarResponsable({ idTicket, idTecnicoResponsable, idUsuarioQueCambia }) {
  const ticket = await ticketsModel.findById(idTicket);
  if (!ticket) {
    throw crearError('Ticket no encontrado', 404);
  }

  const tecnico = await usuariosModel.findById(idTecnicoResponsable);
  if (!tecnico) {
    throw crearError('Técnico no encontrado', 404);
  }

  const esTecnico = await rolesService.esRolTecnicoOAdministrador(tecnico.id_rol);
  if (!esTecnico) {
    throw crearError('El responsable debe ser un técnico', 400);
  }

  const ticketActualizado = await ticketsModel.updateResponsable(idTicket, idTecnicoResponsable);

  await auditoriaService.registrarEvento({
    idUsuario: idUsuarioQueCambia,
    accion: 'CAMBIO_RESPONSABLE',
    detalle: `Ticket ${ticket.numero}: responsable -> ${tecnico.nombre} ${tecnico.apellido}`,
  });

  await historialService.registrarEvento({
    idTicket,
    idUsuario: idUsuarioQueCambia,
    evento: 'CAMBIO_RESPONSABLE',
    detalle: `Ticket ${ticket.numero}: responsable -> ${tecnico.nombre} ${tecnico.apellido}`,
  });

  return ticketActualizado;
}
