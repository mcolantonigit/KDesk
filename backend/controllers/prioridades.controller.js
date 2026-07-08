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
