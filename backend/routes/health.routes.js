import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS hora_servidor');
    res.json({
      status: 'ok',
      horaServidor: result.rows[0].hora_servidor,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'No se pudo conectar a la base de datos',
    });
  }
});

export default router;
