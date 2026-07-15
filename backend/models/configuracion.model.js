import { pool } from '../config/db.js';

const CAMPOS = 'id, dias_retencion_logs, backup_automatico_activo, backup_dias, backup_hora';

export async function obtener() {
  const result = await pool.query(`SELECT ${CAMPOS} FROM configuracion_sistema WHERE id = 1`);
  return result.rows[0];
}

export async function actualizarDiasRetencion(dias) {
  const result = await pool.query(
    `UPDATE configuracion_sistema SET dias_retencion_logs = $1 WHERE id = 1 RETURNING ${CAMPOS}`,
    [dias]
  );
  return result.rows[0];
}

export async function actualizarBackupAutomatico({ activo, dias, hora }) {
  const result = await pool.query(
    `UPDATE configuracion_sistema
     SET backup_automatico_activo = $1, backup_dias = $2, backup_hora = $3
     WHERE id = 1
     RETURNING ${CAMPOS}`,
    [activo, dias, hora]
  );
  return result.rows[0];
}
