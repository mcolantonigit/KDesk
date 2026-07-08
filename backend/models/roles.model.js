import { pool } from '../config/db.js';

export async function findAll() {
  const result = await pool.query('SELECT id, nombre FROM roles ORDER BY id');
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query('SELECT id, nombre FROM roles WHERE id = $1', [id]);
  return result.rows[0];
}
