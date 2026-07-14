import { pool } from '../config/db.js';

export async function create({ idUsuario, tokenHash, tipo, fechaExpiracion }) {
  const result = await pool.query(
    `INSERT INTO tokens_verificacion (id_usuario, token_hash, tipo, fecha_expiracion)
     VALUES ($1, $2, $3, $4)
     RETURNING id, id_usuario, token_hash, tipo, fecha_creacion, fecha_expiracion, usado`,
    [idUsuario, tokenHash, tipo, fechaExpiracion]
  );
  return result.rows[0];
}

export async function findByTokenHash(tokenHash, tipo) {
  const result = await pool.query(
    `SELECT id, id_usuario, token_hash, tipo, fecha_creacion, fecha_expiracion, usado
     FROM tokens_verificacion WHERE token_hash = $1 AND tipo = $2`,
    [tokenHash, tipo]
  );
  return result.rows[0];
}

export async function marcarUsado(id) {
  await pool.query('UPDATE tokens_verificacion SET usado = TRUE WHERE id = $1', [id]);
}
