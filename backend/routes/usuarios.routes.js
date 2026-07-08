import { Router } from 'express';
import * as usuariosController from '../controllers/usuarios.controller.js';
import { requiereAutenticacion } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/usuarios/register', usuariosController.register);
router.post('/usuarios/login', usuariosController.login);
router.post('/usuarios/logout', requiereAutenticacion, usuariosController.logout);
router.get('/usuarios/perfil', requiereAutenticacion, usuariosController.getPerfil);
router.put('/usuarios/perfil/password', requiereAutenticacion, usuariosController.cambiarPassword);
router.get('/usuarios', requiereAutenticacion, usuariosController.getUsuarios);
router.get('/usuarios/:id', requiereAutenticacion, usuariosController.getUsuarioById);

export default router;
