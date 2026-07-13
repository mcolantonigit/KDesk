import * as prioridadesService from '../services/prioridades.service.js';

export async function getPrioridades(req, res) {
  try {
    const prioridades = await prioridadesService.getPrioridades();
    res.json(prioridades);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener las prioridades' });
  }
}

export async function getPrioridadById(req, res) {
  try {
    const prioridad = await prioridadesService.getPrioridadById(req.params.id);
    if (!prioridad) {
      return res.status(404).json({ message: 'Prioridad no encontrada' });
    }
    res.json(prioridad);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener la prioridad' });
  }
}

export async function crearPrioridad(req, res) {
  try {
    const { nombre } = req.body;
    const prioridad = await prioridadesService.crearPrioridad({ nombre });
    res.status(201).json(prioridad);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo crear la prioridad' });
  }
}

export async function editarPrioridad(req, res) {
  try {
    const { nombre, activo } = req.body;
    const prioridad = await prioridadesService.editarPrioridad(req.params.id, { nombre, activo });
    res.json(prioridad);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo editar la prioridad' });
  }
}
