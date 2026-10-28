import { describe, it, expect, beforeEach } from 'vitest';
import { pool } from '../config/db.js';
import { SIN_PASSWORD } from '../models/usuarios.model.js';
import { api, crearUsuario, limpiarDatos } from './helpers.js';

describe('cuentas de Microsoft 365: no tienen contraseña', () => {
  let admin, conPassword, deMicrosoft;

  beforeEach(async () => {
    await limpiarDatos();
    admin = await crearUsuario({ rol: 'administrador' });
    conPassword = await crearUsuario();
    deMicrosoft = await crearUsuario();
    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [SIN_PASSWORD, deMicrosoft.id]);
  });

  it('el perfil dice si la cuenta tiene contraseña', async () => {
    const res1 = await api().get('/api/usuarios/perfil').set('Cookie', conPassword.cookie);
    const res2 = await api().get('/api/usuarios/perfil').set('Cookie', deMicrosoft.cookie);

    expect(res1.body.con_password).toBe(true);
    expect(res2.body.con_password).toBe(false);
    expect(res2.body.password_hash).toBeUndefined();
  });

  it('la lista de usuarios también lo dice', async () => {
    const res = await api().get('/api/usuarios').set('Cookie', admin.cookie);

    const porId = Object.fromEntries(res.body.map((usuario) => [usuario.id, usuario.con_password]));
    expect(porId[conPassword.id]).toBe(true);
    expect(porId[deMicrosoft.id]).toBe(false);
  });

  it('no puede cambiarse una contraseña que no tiene', async () => {
    const res = await api()
      .put('/api/usuarios/perfil/password')
      .set('Cookie', deMicrosoft.cookie)
      .send({ passwordActual: 'loquesea', passwordNueva: 'nueva12345', confirmacion: 'nueva12345' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Microsoft 365/);
  });

  it('un administrador no le puede poner contraseña (sería una puerta de entrada sin Microsoft)', async () => {
    const res = await api()
      .put(`/api/usuarios/${deMicrosoft.id}/password`)
      .set('Cookie', admin.cookie)
      .send({ passwordNueva: 'nueva12345' });

    expect(res.status).toBe(400);
    const hash = await pool.query('SELECT password_hash FROM usuarios WHERE id = $1', [deMicrosoft.id]);
    expect(hash.rows[0].password_hash).toBe(SIN_PASSWORD);
  });

  it('pedir recuperar la contraseña no genera ningún link', async () => {
    const res = await api().post('/api/usuarios/recuperar-password').send({ correo: deMicrosoft.correo });

    expect(res.status).toBe(200);
    const tokens = await pool.query("SELECT count(*)::int AS cantidad FROM tokens_verificacion WHERE id_usuario = $1", [deMicrosoft.id]);
    expect(tokens.rows[0].cantidad).toBe(0);
  });
});
