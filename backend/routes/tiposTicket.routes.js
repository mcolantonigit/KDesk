import { Router } from 'express';
import * as tiposTicketController from '../controllers/tiposTicket.controller.js';
import { requiereAutenticacion, requiereRolAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/tipos-ticket', tiposTicketController.getTiposTicket);
router.get('/tipos-ticket/:id', tiposTicketController.getTipoTicketById);
router.post('/tipos-ticket', requiereAutenticacion, requiereRolAdministrador, tiposTicketController.crearTipoTicket);
router.patch('/tipos-ticket/:id', requiereAutenticacion, requiereRolAdministrador, tiposTicketController.editarTipoTicket);

export default router;
