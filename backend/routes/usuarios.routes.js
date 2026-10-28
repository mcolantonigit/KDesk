import { Router } from 'express';
import * as usuariosController from '../controllers/usuarios.controller.js';
import {
  requiereAutenticacion,
  requiereRolTecnico,
  requiereRolAdministrador,
  requiereLoginConPassword,
} from '../middleware/auth.middleware.js';

const router = Router();

router.post('/usuarios/register', requiereLoginConPassword, usuariosController.register);
router.post('/usuarios/activar', requiereLoginConPassword, usuariosController.activarCuenta);
router.post('/usuarios/reenviar-activacion', requiereLoginConPassword, usuariosController.reenviarActivacion);
router.post('/usuarios/recuperar-password', requiereLoginConPassword, usuariosController.solicitarResetPassword);
router.post('/usuarios/resetear-password', requiereLoginConPassword, usuariosController.resetearPassword);
router.post('/usuarios/login', requiereLoginConPassword, usuariosController.login);
router.post('/usuarios/logout', requiereAutenticacion, usuariosController.logout);
router.get('/usuarios/perfil', requiereAutenticacion, usuariosController.getPerfil);
router.put('/usuarios/perfil', requiereAutenticacion, usuariosController.actualizarPerfil);
router.put('/usuarios/perfil/password', requiereAutenticacion, requiereLoginConPassword, usuariosController.cambiarPassword);
router.get('/usuarios', requiereAutenticacion, requiereRolTecnico, usuariosController.getUsuarios);
router.get('/usuarios/:id', requiereAutenticacion, requiereRolTecnico, usuariosController.getUsuarioById);
router.patch('/usuarios/:id/rol', requiereAutenticacion, requiereRolAdministrador, usuariosController.cambiarRol);
router.patch('/usuarios/:id/activo', requiereAutenticacion, requiereRolAdministrador, usuariosController.cambiarActivo);
router.put('/usuarios/:id/password', requiereAutenticacion, requiereRolAdministrador, usuariosController.blanquearPassword);

export default router;
