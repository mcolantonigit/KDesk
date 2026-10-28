import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.get('/auth/config', authController.getConfig);
router.get('/auth/microsoft/login', authController.iniciarMicrosoft);
router.get('/auth/microsoft/callback', authController.callbackMicrosoft);
router.get('/auth/microsoft/alta', authController.getAlta);
router.post('/auth/microsoft/alta', authController.confirmarAlta);

export default router;
