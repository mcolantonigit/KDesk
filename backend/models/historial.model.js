import { pool } from '../config/db.js';

export async function create({ idTicket, idUsuario, evento, detalle }) {
  const result = await pool.query(
    `INSERT INTO historial_ticket (id_ticket, id_usuario, evento, detalle)
     VALUES ($1, $2, $3, $4)
     RETURNING id, id_ticket, id_usuario, evento, detalle, fecha`,
    [idTicket, idUsuario, evento, detalle]
  );
  return result.rows[0];
}

export async function findAllByTicket(idTicket) {
  const result = await pool.query(
    `SELECT id, id_ticket, id_usuario, evento, detalle, fecha
     FROM historial_ticket WHERE id_ticket = $1 ORDER BY fecha`,
    [idTicket]
  );
  return result.rows;
}

export async function deleteAnterioresA(fecha) {
  const result = await pool.query('DELETE FROM historial_ticket WHERE fecha < $1', [fecha]);
  return result.rowCount;
}
