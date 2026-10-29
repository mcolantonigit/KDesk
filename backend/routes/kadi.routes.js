import { Router } from 'express';
import * as kadiController from '../controllers/kadi.controller.js';
import { requiereAutenticacion } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/kadi/estado', requiereAutenticacion, kadiController.getEstado);
router.post('/kadi/mensaje', requiereAutenticacion, kadiController.enviarMensaje);

export default router;
