import { Router } from 'express';
import * as historialController from '../controllers/historial.controller.js';
import { requiereAutenticacion } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/tickets/:idTicket/historial', requiereAutenticacion, historialController.getHistorial);

export default router;
