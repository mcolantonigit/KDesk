import { Router } from 'express';
import * as comentariosController from '../controllers/comentarios.controller.js';
import { requiereAutenticacion } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/tickets/:idTicket/comentarios', requiereAutenticacion, comentariosController.crearComentario);
router.get('/tickets/:idTicket/comentarios', requiereAutenticacion, comentariosController.getComentarios);
router.delete('/comentarios/:id', requiereAutenticacion, comentariosController.eliminarComentario);

export default router;
