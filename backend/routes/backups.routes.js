import { Router } from 'express';
import * as backupsController from '../controllers/backups.controller.js';
import { requiereAutenticacion, requiereRolTecnico } from '../middleware/auth.middleware.js';
import { subirArchivoBackup } from '../middleware/uploadBackup.middleware.js';

const router = Router();

router.get('/backups', requiereAutenticacion, requiereRolTecnico, backupsController.getBackups);
router.post('/backups', requiereAutenticacion, requiereRolTecnico, backupsController.postBackupManual);
router.get(
  '/backups/configuracion',
  requiereAutenticacion,
  requiereRolTecnico,
  backupsController.getConfiguracionBackup
);
router.put(
  '/backups/configuracion',
  requiereAutenticacion,
  requiereRolTecnico,
  backupsController.putConfiguracionBackup
);
router.get(
  '/backups/:nombreArchivo/descargar',
  requiereAutenticacion,
  requiereRolTecnico,
  backupsController.getDescargarBackup
);
router.post('/backups/restaurar', requiereAutenticacion, requiereRolTecnico, backupsController.postRestaurar);
router.post(
  '/backups/restaurar-archivo',
  requiereAutenticacion,
  requiereRolTecnico,
  subirArchivoBackup,
  backupsController.postRestaurarDesdeArchivo
);

export default router;
