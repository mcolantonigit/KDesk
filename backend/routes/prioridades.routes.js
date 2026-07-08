import { Router } from 'express';
import * as prioridadesController from '../controllers/prioridades.controller.js';

const router = Router();

router.get('/prioridades', prioridadesController.getPrioridades);
router.get('/prioridades/:id', prioridadesController.getPrioridadById);

export default router;
