import { Router } from 'express';
import * as ticketsController from '../controllers/tickets.controller.js';
import { requiereAutenticacion, requiereRolTecnico } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/tickets', requiereAutenticacion, ticketsController.crearTicket);
router.get('/tickets', requiereAutenticacion, ticketsController.getTickets);
router.get('/tickets/:id', requiereAutenticacion, ticketsController.getTicketById);
router.patch('/tickets/:id/estado', requiereAutenticacion, requiereRolTecnico, ticketsController.cambiarEstado);
router.patch('/tickets/:id/cerrar', requiereAutenticacion, ticketsController.cerrarTicket);
router.patch('/tickets/:id/tipo', requiereAutenticacion, requiereRolTecnico, ticketsController.cambiarTipo);
router.patch('/tickets/:id/prioridad', requiereAutenticacion, requiereRolTecnico, ticketsController.cambiarPrioridad);
router.patch('/tickets/:id/responsable', requiereAutenticacion, requiereRolTecnico, ticketsController.asignarResponsable);

export default router;
