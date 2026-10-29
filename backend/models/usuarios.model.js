import { pool } from '../config/db.js';

// Los usuarios creados por el login de Microsoft 365 no tienen contraseña: se
// guarda este valor, que no es un hash de bcrypt y nunca coincide con nada.
export const SIN_PASSWORD = '!microsoft365';

const CAMPOS_PUBLICOS =
  'id, nombre, apellido, correo, id_rol, id_sucursal, id_sector, fecha_registro, activo, email_verificado, activacion_reenviada, kadi_habilitada, ' +
  `password_hash <> '${SIN_PASSWORD}' AS con_password`;

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

export async function findPasswordHashById(id) {
  const result = await pool.query('SELECT password_hash FROM usuarios WHERE id = $1', [id]);
  return result.rows[0]?.password_hash;
}

export async function updateNombreApellido(id, { nombre, apellido }) {
  const result = await pool.query(
    `UPDATE usuarios SET nombre = $1, apellido = $2 WHERE id = $3 RETURNING ${CAMPOS_PUBLICOS}`,
    [nombre, apellido, id]
  );
  return result.rows[0];
}

export async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
}

export async function deleteById(id) {
  await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
}

export async function marcarEmailVerificado(id) {
  const result = await pool.query(
    `UPDATE usuarios SET email_verificado = TRUE WHERE id = $1 RETURNING ${CAMPOS_PUBLICOS}`,
    [id]
  );
  return result.rows[0];
}

export async function marcarReenvioActivacion(id) {
  const result = await pool.query(
    `UPDATE usuarios SET activacion_reenviada = TRUE WHERE id = $1 RETURNING ${CAMPOS_PUBLICOS}`,
    [id]
  );
  return result.rows[0];
}

export async function updateRol(id, idRol) {
  const result = await pool.query(
    `UPDATE usuarios SET id_rol = $1 WHERE id = $2 RETURNING ${CAMPOS_PUBLICOS}`,
    [idRol, id]
  );
  return result.rows[0];
}

// Administradores activos sin contar al indicado: para no dejar nunca al
// sistema sin ninguno.
export async function countOtrosAdministradoresActivos(idExcluido) {
  const result = await pool.query(
    `SELECT count(*)::int AS cantidad
     FROM usuarios u JOIN roles r ON r.id = u.id_rol
     WHERE r.nombre = 'administrador' AND u.activo AND u.id <> $1`,
    [idExcluido]
  );
  return result.rows[0].cantidad;
}

export async function updateKadi(id, habilitada) {
  const result = await pool.query(
    `UPDATE usuarios SET kadi_habilitada = $1 WHERE id = $2 RETURNING ${CAMPOS_PUBLICOS}`,
    [habilitada, id]
  );
  return result.rows[0];
}

export async function updateActivo(id, activo) {
  const result = await pool.query(
    `UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING ${CAMPOS_PUBLICOS}`,
    [activo, id]
  );
  return result.rows[0];
}

// Las cuentas nuevas nacen con Kadi habilitada (en producción no se nota
// mientras KADI_ACTIVA no esté en "on"). Las que ya existían quedan como están.
export async function create({ nombre, apellido, correo, passwordHash, idRol, idSucursal, idSector }) {
  const result = await pool.query(
    `INSERT INTO usuarios (nombre, apellido, correo, password_hash, id_rol, id_sucursal, id_sector, kadi_habilitada)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${CAMPOS_PUBLICOS}`,
    [nombre, apellido, correo, passwordHash, idRol, idSucursal, idSector, true]
  );
  return result.rows[0];
}
