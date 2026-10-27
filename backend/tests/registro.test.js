import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pool } from '../config/db.js';
import { api, limpiarDatos } from './helpers.js';

vi.mock('../utils/mailer.util.js', () => ({
  enviarMailActivacion: vi.fn().mockResolvedValue(undefined),
  enviarMailResetPassword: vi.fn().mockResolvedValue(undefined),
}));

describe('registro con contraseña', () => {
  beforeEach(async () => {
    await limpiarDatos();
  });

  it('ignora el rol que mande el navegador: quien se registra siempre queda como usuario', async () => {
    const sucursal = (await pool.query('SELECT id FROM sucursales LIMIT 1')).rows[0].id;
    const sector = (await pool.query('SELECT id FROM sectores LIMIT 1')).rows[0].id;

    const res = await api().post('/api/usuarios/register').send({
      nombre: 'Intento',
      apellido: 'De Admin',
      correo: 'intento@tuempresa.com',
      password: 'clave-segura',
      idRol: 3,
      idSucursal: sucursal,
      idSector: sector,
    });

    expect(res.status).toBe(201);
    const guardado = await pool.query("SELECT r.nombre FROM usuarios u JOIN roles r ON r.id = u.id_rol WHERE u.correo = 'intento@tuempresa.com'");
    expect(guardado.rows[0].nombre).toBe('usuario');
  });
});
