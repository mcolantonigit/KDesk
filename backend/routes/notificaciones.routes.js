import { Router } from 'express';
import * as notificacionesController from '../controllers/notificaciones.controller.js';
import { requiereAutenticacion } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/notificaciones', requiereAutenticacion, notificacionesController.getNotificaciones);

export default router;
