import { Router } from 'express';
import * as estadosController from '../controllers/estados.controller.js';

const router = Router();

router.get('/estados', estadosController.getEstados);
router.get('/estados/:id', estadosController.getEstadoById);

export default router;
