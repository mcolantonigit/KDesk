import request from 'supertest';
import app from '../app.js';
import { pool } from '../config/db.js';
import { generarToken } from '../utils/jwt.util.js';

let contador = 0;

async function idCatalogo(tabla, nombre) {
  const res = await pool.query(`SELECT id FROM ${tabla} WHERE nombre = $1`, [nombre]);
  return res.rows[0].id;
}

async function primerId(tabla) {
  const res = await pool.query(`SELECT id FROM ${tabla} ORDER BY id LIMIT 1`);
  return res.rows[0].id;
}

// Los catálogos (roles, estados, etc.) vienen del schema y no se vacían
// entre tests. Cada usuario sale con un correo único y una cookie de sesión lista.
export async function crearUsuario({ rol = 'usuario' } = {}) {
  contador += 1;
  const idRol = await idCatalogo('roles', rol);
  const res = await pool.query(
    `INSERT INTO usuarios (nombre, apellido, correo, password_hash, id_rol, id_sucursal, id_sector, email_verificado)
     VALUES ($1, $2, $3, 'x', $4, $5, $6, TRUE)
     RETURNING id, nombre, apellido, correo, id_rol`,
    [
      `Nombre${contador}`,
      `Apellido${contador}`,
      `test${contador}-${Date.now()}@tuempresa.com`,
      idRol,
      await primerId('sucursales'),
      await primerId('sectores'),
    ]
  );
  const usuario = res.rows[0];
  const token = generarToken({ id: usuario.id, correo: usuario.correo, idRol: usuario.id_rol });
  return { ...usuario, cookie: `token=${token}` };
}

export async function crearTicket(creador) {
  const res = await pool.query(
    `INSERT INTO tickets (titulo, descripcion, nombre_descriptivo, id_tipo, id_prioridad_sugerida, id_estado,
                          id_usuario_creador, id_sucursal, id_sector)
     VALUES ('Ticket de prueba', 'Descripción', 'Ticket de prueba', $1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      await primerId('tipos_ticket'),
      await primerId('prioridades'),
      await primerId('estados'),
      creador.id,
      await primerId('sucursales'),
      await primerId('sectores'),
    ]
  );
  return res.rows[0];
}

// Vacía los datos que crean los tests y deja intactos los catálogos.
export async function limpiarDatos() {
  await pool.query(
    `TRUNCATE adjuntos, comentarios, tareas_tecnicas, historial_ticket, auditoria, tokens_verificacion,
              tickets, usuarios RESTART IDENTITY CASCADE`
  );
}

export function api() {
  return request(app);
}
