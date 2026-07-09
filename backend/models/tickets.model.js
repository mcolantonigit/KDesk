import { pool } from '../config/db.js';

const CAMPOS = `id, numero, titulo, descripcion, nombre_descriptivo, id_tipo,
  id_prioridad_sugerida, id_prioridad, id_estado, id_usuario_creador,
  id_tecnico_responsable, id_sucursal, id_sector, fecha_creacion,
  fecha_actualizacion, fecha_cierre`;

export async function findAll() {
  const result = await pool.query(`SELECT ${CAMPOS} FROM tickets ORDER BY fecha_creacion DESC`);
  return result.rows;
}

export async function findAllByUsuarioCreador(idUsuarioCreador) {
  const result = await pool.query(
    `SELECT ${CAMPOS} FROM tickets WHERE id_usuario_creador = $1 ORDER BY fecha_creacion DESC`,
    [idUsuarioCreador]
  );
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(`SELECT ${CAMPOS} FROM tickets WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function create({
  titulo,
  descripcion,
  nombreDescriptivo,
  idTipo,
  idPrioridadSugerida,
  idEstado,
  idUsuarioCreador,
  idSucursal,
  idSector,
}) {
  const result = await pool.query(
    `INSERT INTO tickets (titulo, descripcion, nombre_descriptivo, id_tipo,
       id_prioridad_sugerida, id_estado, id_usuario_creador, id_sucursal, id_sector)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING ${CAMPOS}`,
    [titulo, descripcion, nombreDescriptivo, idTipo, idPrioridadSugerida, idEstado, idUsuarioCreador, idSucursal, idSector]
  );
  return result.rows[0];
}

export async function updateEstado(id, idEstado) {
  const result = await pool.query(
    `UPDATE tickets SET id_estado = $1 WHERE id = $2 RETURNING ${CAMPOS}`,
    [idEstado, id]
  );
  return result.rows[0];
}

export async function updatePrioridad(id, idPrioridad) {
  const result = await pool.query(
    `UPDATE tickets SET id_prioridad = $1 WHERE id = $2 RETURNING ${CAMPOS}`,
    [idPrioridad, id]
  );
  return result.rows[0];
}

export async function updateResponsable(id, idTecnicoResponsable) {
  const result = await pool.query(
    `UPDATE tickets SET id_tecnico_responsable = $1 WHERE id = $2 RETURNING ${CAMPOS}`,
    [idTecnicoResponsable, id]
  );
  return result.rows[0];
}
