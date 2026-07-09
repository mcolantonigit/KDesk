import { pool } from '../config/db.js';

const CAMPOS = `id, id_ticket, id_comentario, id_tarea, nombre_archivo, ruta_archivo,
  tipo_archivo, tamano_bytes, id_usuario_subio, fecha_subida`;

export async function create({
  idTicket,
  idComentario,
  idTarea,
  nombreArchivo,
  rutaArchivo,
  tipoArchivo,
  tamanoBytes,
  idUsuarioSubio,
}) {
  const result = await pool.query(
    `INSERT INTO adjuntos (id_ticket, id_comentario, id_tarea, nombre_archivo, ruta_archivo, tipo_archivo, tamano_bytes, id_usuario_subio)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${CAMPOS}`,
    [idTicket ?? null, idComentario ?? null, idTarea ?? null, nombreArchivo, rutaArchivo, tipoArchivo, tamanoBytes, idUsuarioSubio]
  );
  return result.rows[0];
}

export async function findAllByTicket(idTicket) {
  const result = await pool.query(`SELECT ${CAMPOS} FROM adjuntos WHERE id_ticket = $1 ORDER BY fecha_subida`, [idTicket]);
  return result.rows;
}

export async function findAllByComentario(idComentario) {
  const result = await pool.query(`SELECT ${CAMPOS} FROM adjuntos WHERE id_comentario = $1 ORDER BY fecha_subida`, [idComentario]);
  return result.rows;
}

export async function findAllByTarea(idTarea) {
  const result = await pool.query(`SELECT ${CAMPOS} FROM adjuntos WHERE id_tarea = $1 ORDER BY fecha_subida`, [idTarea]);
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(`SELECT ${CAMPOS} FROM adjuntos WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function deleteById(id) {
  const result = await pool.query(`DELETE FROM adjuntos WHERE id = $1 RETURNING ${CAMPOS}`, [id]);
  return result.rows[0];
}
