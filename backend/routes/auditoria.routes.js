import { Router } from 'express';
import * as auditoriaController from '../controllers/auditoria.controller.js';
import { requiereAutenticacion, requiereRolTecnico } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/auditoria', requiereAutenticacion, requiereRolTecnico, auditoriaController.getAuditoria);

export default router;
