import { Router } from 'express';
import * as adjuntosController from '../controllers/adjuntos.controller.js';
import { requiereAutenticacion, requiereRolTecnico } from '../middleware/auth.middleware.js';
import { subirArchivo } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/tickets/:idTicket/adjuntos', requiereAutenticacion, subirArchivo, adjuntosController.subirAdjuntoDeTicket);
router.get('/tickets/:idTicket/adjuntos', requiereAutenticacion, adjuntosController.getAdjuntosDeTicket);

router.post('/comentarios/:idComentario/adjuntos', requiereAutenticacion, subirArchivo, adjuntosController.subirAdjuntoDeComentario);
router.get('/comentarios/:idComentario/adjuntos', requiereAutenticacion, adjuntosController.getAdjuntosDeComentario);

router.post(
  '/tareas/:idTarea/adjuntos',
  requiereAutenticacion,
  requiereRolTecnico,
  subirArchivo,
  adjuntosController.subirAdjuntoDeTarea
);
router.get('/tareas/:idTarea/adjuntos', requiereAutenticacion, requiereRolTecnico, adjuntosController.getAdjuntosDeTarea);

router.get('/adjuntos/:id/descargar', requiereAutenticacion, adjuntosController.descargarAdjunto);
router.delete('/adjuntos/:id', requiereAutenticacion, adjuntosController.eliminarAdjunto);

export default router;
