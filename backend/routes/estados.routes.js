import { Router } from 'express';
import * as estadosController from '../controllers/estados.controller.js';
import { requiereAutenticacion, requiereRolAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/estados', estadosController.getEstados);
router.get('/estados/:id', estadosController.getEstadoById);
router.post('/estados', requiereAutenticacion, requiereRolAdministrador, estadosController.crearEstado);
router.patch('/estados/:id', requiereAutenticacion, requiereRolAdministrador, estadosController.editarEstado);

export default router;
