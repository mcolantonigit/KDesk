import { pool } from '../config/db.js';

export async function findAll() {
  const result = await pool.query('SELECT id, nombre, activo FROM sectores ORDER BY id');
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query('SELECT id, nombre, activo FROM sectores WHERE id = $1', [id]);
  return result.rows[0];
}

export async function create({ nombre }) {
  const result = await pool.query(
    'INSERT INTO sectores (nombre) VALUES ($1) RETURNING id, nombre, activo',
    [nombre]
  );
  return result.rows[0];
}

export async function update(id, { nombre, activo }) {
  const result = await pool.query(
    'UPDATE sectores SET nombre = COALESCE($1, nombre), activo = COALESCE($2, activo) WHERE id = $3 RETURNING id, nombre, activo',
    [nombre, activo, id]
  );
  return result.rows[0];
}
