import { Router } from 'express';
import * as sectoresController from '../controllers/sectores.controller.js';
import { requiereAutenticacion, requiereRolAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/sectores', sectoresController.getSectores);
router.get('/sectores/:id', sectoresController.getSectorById);
router.post('/sectores', requiereAutenticacion, requiereRolAdministrador, sectoresController.crearSector);
router.patch('/sectores/:id', requiereAutenticacion, requiereRolAdministrador, sectoresController.editarSector);

export default router;
