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
