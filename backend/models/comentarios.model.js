import { pool } from '../config/db.js';

const CAMPOS = 'id, id_ticket, id_autor, contenido, fecha_creacion, eliminado, fecha_eliminacion';

export async function create({ idTicket, idAutor, contenido }) {
  const result = await pool.query(
    `INSERT INTO comentarios (id_ticket, id_autor, contenido)
     VALUES ($1, $2, $3)
     RETURNING ${CAMPOS}`,
    [idTicket, idAutor, contenido]
  );
  return result.rows[0];
}

export async function findAllByTicket(idTicket) {
  const result = await pool.query(
    `SELECT c.id, c.id_ticket, c.id_autor, c.contenido, c.fecha_creacion, c.eliminado, c.fecha_eliminacion,
            u.nombre AS autor_nombre, u.apellido AS autor_apellido
     FROM comentarios c
     JOIN usuarios u ON u.id = c.id_autor
     WHERE c.id_ticket = $1
     ORDER BY c.fecha_creacion`,
    [idTicket]
  );
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(`SELECT ${CAMPOS} FROM comentarios WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function softDelete(id) {
  const result = await pool.query(
    `UPDATE comentarios SET eliminado = TRUE, fecha_eliminacion = NOW()
     WHERE id = $1
     RETURNING ${CAMPOS}`,
    [id]
  );
  return result.rows[0];
}
