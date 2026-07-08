import { Router } from 'express';
import * as tiposTicketController from '../controllers/tiposTicket.controller.js';

const router = Router();

router.get('/tipos-ticket', tiposTicketController.getTiposTicket);
router.get('/tipos-ticket/:id', tiposTicketController.getTipoTicketById);

export default router;
