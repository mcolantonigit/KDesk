import { pool } from '../config/db.js';

export async function obtener() {
  const result = await pool.query('SELECT id, dias_retencion_logs FROM configuracion_sistema WHERE id = 1');
  return result.rows[0];
}

export async function actualizarDiasRetencion(dias) {
  const result = await pool.query(
    'UPDATE configuracion_sistema SET dias_retencion_logs = $1 WHERE id = 1 RETURNING id, dias_retencion_logs',
    [dias]
  );
  return result.rows[0];
}
