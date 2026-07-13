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

export async function crearEstado(req, res) {
  try {
    const { nombre } = req.body;
    const estado = await estadosService.crearEstado({ nombre });
    res.status(201).json(estado);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo crear el estado' });
  }
}

export async function editarEstado(req, res) {
  try {
    const { nombre, activo } = req.body;
    const estado = await estadosService.editarEstado(req.params.id, { nombre, activo });
    res.json(estado);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo editar el estado' });
  }
}
