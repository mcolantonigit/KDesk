import * as historialService from '../services/historial.service.js';
import * as ticketsService from '../services/tickets.service.js';

export async function getHistorial(req, res) {
  try {
    const ticket = await ticketsService.obtenerTicketPorId(req.params.idTicket, req.usuario);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }
    const historial = await historialService.obtenerHistorialDeTicket(req.params.idTicket);
    res.json(historial);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo obtener el historial' });
  }
}
