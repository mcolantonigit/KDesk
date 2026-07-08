import * as estadosService from '../services/estados.service.js';

export async function getEstados(req, res) {
  try {
    const estados = await estadosService.getEstados();
    res.json(estados);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener los estados' });
  }
}

export async function getEstadoById(req, res) {
  try {
    const estado = await estadosService.getEstadoById(req.params.id);
    if (!estado) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    res.json(estado);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener el estado' });
  }
}
