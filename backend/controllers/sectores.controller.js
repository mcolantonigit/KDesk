import * as sectoresService from '../services/sectores.service.js';

export async function getSectores(req, res) {
  try {
    const sectores = await sectoresService.getSectores();
    res.json(sectores);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener los sectores' });
  }
}

export async function getSectorById(req, res) {
  try {
    const sector = await sectoresService.getSectorById(req.params.id);
    if (!sector) {
      return res.status(404).json({ message: 'Sector no encontrado' });
    }
    res.json(sector);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener el sector' });
  }
}

export async function crearSector(req, res) {
  try {
    const { nombre } = req.body;
    const sector = await sectoresService.crearSector({ nombre });
    res.status(201).json(sector);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo crear el sector' });
  }
}

export async function editarSector(req, res) {
  try {
    const { nombre, activo } = req.body;
    const sector = await sectoresService.editarSector(req.params.id, { nombre, activo });
    res.json(sector);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo editar el sector' });
  }
}
