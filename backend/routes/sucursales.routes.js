import { Router } from 'express';
import * as sucursalesController from '../controllers/sucursales.controller.js';
import { requiereAutenticacion, requiereRolAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/sucursales', sucursalesController.getSucursales);
router.get('/sucursales/:id', sucursalesController.getSucursalById);
router.post('/sucursales', requiereAutenticacion, requiereRolAdministrador, sucursalesController.crearSucursal);
router.patch('/sucursales/:id', requiereAutenticacion, requiereRolAdministrador, sucursalesController.editarSucursal);

export default router;
