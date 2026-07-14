import { Router } from 'express';
import * as auditoriaController from '../controllers/auditoria.controller.js';
import { requiereAutenticacion, requiereRolTecnico, requiereRolAdministrador } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/auditoria', requiereAutenticacion, requiereRolTecnico, auditoriaController.getAuditoria);
router.get(
  '/auditoria/retencion',
  requiereAutenticacion,
  requiereRolAdministrador,
  auditoriaController.getConfiguracionRetencion
);
router.patch(
  '/auditoria/retencion',
  requiereAutenticacion,
  requiereRolAdministrador,
  auditoriaController.actualizarConfiguracionRetencion
);
router.post('/auditoria/limpiar', requiereAutenticacion, requiereRolAdministrador, auditoriaController.limpiarLogs);

export default router;
