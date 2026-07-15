import * as ticketsService from '../services/tickets.service.js';

export async function crearTicket(req, res) {
  try {
    const { idTipo, idPrioridadSugerida, titulo, descripcion, idSucursal, idSector, idUsuarioCreador } = req.body;
    const ticket = await ticketsService.crearTicket({
      idUsuarioActor: req.usuario.id,
      idRolActor: req.usuario.idRol,
      idTipo,
      idPrioridadSugerida,
      titulo,
      descripcion,
      idSucursal,
      idSector,
      idUsuarioCreador,
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo crear el ticket' });
  }
}

export async function getTickets(req, res) {
  try {
    const tickets = await ticketsService.listarTickets(req.usuario);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener los tickets' });
  }
}

export async function getTicketById(req, res) {
  try {
    const ticket = await ticketsService.obtenerTicketPorId(req.params.id, req.usuario);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo obtener el ticket' });
  }
}

export async function cambiarEstado(req, res) {
  try {
    const { idEstado } = req.body;
    const ticket = await ticketsService.cambiarEstado({
      idTicket: req.params.id,
      idEstado,
      idUsuarioQueCambia: req.usuario.id,
    });
    res.json(ticket);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo cambiar el estado' });
  }
}

export async function cerrarTicket(req, res) {
  try {
    const { comentario } = req.body;
    const ticket = await ticketsService.cerrarTicket({
      idTicket: req.params.id,
      comentario,
      usuario: req.usuario,
    });
    res.json(ticket);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo cerrar el ticket' });
  }
}

export async function cambiarPrioridad(req, res) {
  try {
    const { idPrioridad } = req.body;
    const ticket = await ticketsService.cambiarPrioridad({
      idTicket: req.params.id,
      idPrioridad,
      idUsuarioQueCambia: req.usuario.id,
    });
    res.json(ticket);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo cambiar la prioridad' });
  }
}

export async function asignarResponsable(req, res) {
  try {
    const { idTecnicoResponsable } = req.body;
    const ticket = await ticketsService.asignarResponsable({
      idTicket: req.params.id,
      idTecnicoResponsable,
      idUsuarioQueCambia: req.usuario.id,
    });
    res.json(ticket);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo asignar el responsable' });
  }
}
