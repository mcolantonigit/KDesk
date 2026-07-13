import { Router } from 'express';
import * as prioridadesController from '../controllers/prioridades.controller.js';
import { requiereAutenticacion, requiereRolAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/prioridades', prioridadesController.getPrioridades);
router.get('/prioridades/:id', prioridadesController.getPrioridadById);
router.post('/prioridades', requiereAutenticacion, requiereRolAdministrador, prioridadesController.crearPrioridad);
router.patch('/prioridades/:id', requiereAutenticacion, requiereRolAdministrador, prioridadesController.editarPrioridad);

export default router;
