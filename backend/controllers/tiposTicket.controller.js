import * as tiposTicketService from '../services/tiposTicket.service.js';

export async function getTiposTicket(req, res) {
  try {
    const tipos = await tiposTicketService.getTiposTicket();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener los tipos de ticket' });
  }
}

export async function getTipoTicketById(req, res) {
  try {
    const tipo = await tiposTicketService.getTipoTicketById(req.params.id);
    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de ticket no encontrado' });
    }
    res.json(tipo);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener el tipo de ticket' });
  }
}

export async function crearTipoTicket(req, res) {
  try {
    const { nombre } = req.body;
    const tipo = await tiposTicketService.crearTipoTicket({ nombre });
    res.status(201).json(tipo);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo crear el tipo de ticket' });
  }
}

export async function editarTipoTicket(req, res) {
  try {
    const { nombre, activo } = req.body;
    const tipo = await tiposTicketService.editarTipoTicket(req.params.id, { nombre, activo });
    res.json(tipo);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo editar el tipo de ticket' });
  }
}
