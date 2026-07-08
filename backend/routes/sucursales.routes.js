import { Router } from 'express';
import * as sucursalesController from '../controllers/sucursales.controller.js';

const router = Router();

router.get('/sucursales', sucursalesController.getSucursales);
router.get('/sucursales/:id', sucursalesController.getSucursalById);

export default router;
