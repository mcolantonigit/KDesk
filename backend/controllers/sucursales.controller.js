import * as sucursalesService from '../services/sucursales.service.js';

export async function getSucursales(req, res) {
  try {
    const sucursales = await sucursalesService.getSucursales();
    res.json(sucursales);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener las sucursales' });
  }
}

export async function getSucursalById(req, res) {
  try {
    const sucursal = await sucursalesService.getSucursalById(req.params.id);
    if (!sucursal) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }
    res.json(sucursal);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener la sucursal' });
  }
}

export async function crearSucursal(req, res) {
  try {
    const { nombre } = req.body;
    const sucursal = await sucursalesService.crearSucursal({ nombre });
    res.status(201).json(sucursal);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo crear la sucursal' });
  }
}

export async function editarSucursal(req, res) {
  try {
    const { nombre, activo } = req.body;
    const sucursal = await sucursalesService.editarSucursal(req.params.id, { nombre, activo });
    res.json(sucursal);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo editar la sucursal' });
  }
}
