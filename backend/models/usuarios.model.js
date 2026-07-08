import { pool } from '../config/db.js';

const CAMPOS_PUBLICOS = 'id, nombre, apellido, correo, id_rol, id_sucursal, id_sector, fecha_registro, activo';

export async function findAll() {
  const result = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY id`);
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function findByCorreo(correo) {
  const result = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}, password_hash FROM usuarios WHERE correo = $1`,
    [correo]
  );
  return result.rows[0];
}

export async function create({ nombre, apellido, correo, passwordHash, idRol, idSucursal, idSector }) {
  const result = await pool.query(
    `INSERT INTO usuarios (nombre, apellido, correo, password_hash, id_rol, id_sucursal, id_sector)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${CAMPOS_PUBLICOS}`,
    [nombre, apellido, correo, passwordHash, idRol, idSucursal, idSector]
  );
  return result.rows[0];
}
