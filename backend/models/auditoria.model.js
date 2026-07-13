import { pool } from '../config/db.js';

export async function create({ idUsuario, accion, detalle }) {
  const result = await pool.query(
    `INSERT INTO auditoria (id_usuario, accion, detalle)
     VALUES ($1, $2, $3)
     RETURNING id, id_usuario, accion, detalle, fecha`,
    [idUsuario, accion, detalle]
  );
  return result.rows[0];
}

export async function findAll() {
  const result = await pool.query(
    'SELECT id, id_usuario, accion, detalle, fecha FROM auditoria ORDER BY fecha DESC'
  );
  return result.rows;
}
