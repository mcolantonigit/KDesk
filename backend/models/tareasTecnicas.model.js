import { pool } from '../config/db.js';

const CAMPOS = 'id, id_ticket, descripcion, completada, fecha_creacion, fecha_completada';

export async function create({ idTicket, descripcion }) {
  const result = await pool.query(
    `INSERT INTO tareas_tecnicas (id_ticket, descripcion)
     VALUES ($1, $2)
     RETURNING ${CAMPOS}`,
    [idTicket, descripcion]
  );
  return result.rows[0];
}

export async function findAllByTicket(idTicket) {
  const result = await pool.query(
    `SELECT ${CAMPOS} FROM tareas_tecnicas WHERE id_ticket = $1 ORDER BY fecha_creacion`,
    [idTicket]
  );
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(`SELECT ${CAMPOS} FROM tareas_tecnicas WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function marcarCompletada(id) {
  const result = await pool.query(
    `UPDATE tareas_tecnicas SET completada = TRUE, fecha_completada = NOW()
     WHERE id = $1
     RETURNING ${CAMPOS}`,
    [id]
  );
  return result.rows[0];
}

export async function marcarPendiente(id) {
  const result = await pool.query(
    `UPDATE tareas_tecnicas SET completada = FALSE, fecha_completada = NULL
     WHERE id = $1
     RETURNING ${CAMPOS}`,
    [id]
  );
  return result.rows[0];
}

export async function updateDescripcion(id, descripcion) {
  const result = await pool.query(
    `UPDATE tareas_tecnicas SET descripcion = $1 WHERE id = $2 RETURNING ${CAMPOS}`,
    [descripcion, id]
  );
  return result.rows[0];
}

export async function deleteById(id) {
  const result = await pool.query(`DELETE FROM tareas_tecnicas WHERE id = $1 RETURNING ${CAMPOS}`, [id]);
  return result.rows[0];
}
