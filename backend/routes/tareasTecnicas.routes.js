import { Router } from 'express';
import * as tareasController from '../controllers/tareasTecnicas.controller.js';
import { requiereAutenticacion, requiereRolTecnico } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/tickets/:idTicket/tareas', requiereAutenticacion, requiereRolTecnico, tareasController.crearTarea);
router.get('/tickets/:idTicket/tareas', requiereAutenticacion, requiereRolTecnico, tareasController.getTareas);
router.patch('/tareas/:id/completar', requiereAutenticacion, requiereRolTecnico, tareasController.completarTarea);

export default router;
