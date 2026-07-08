import { Router } from 'express';
import * as rolesController from '../controllers/roles.controller.js';

const router = Router();

router.get('/roles', rolesController.getRoles);
router.get('/roles/:id', rolesController.getRoleById);

export default router;
