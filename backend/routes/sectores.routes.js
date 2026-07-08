import { Router } from 'express';
import * as sectoresController from '../controllers/sectores.controller.js';

const router = Router();

router.get('/sectores', sectoresController.getSectores);
router.get('/sectores/:id', sectoresController.getSectorById);

export default router;
