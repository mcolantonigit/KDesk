import { describe, it, expect, beforeEach } from 'vitest';
import { pool } from '../config/db.js';
import { api, crearUsuario, limpiarDatos } from './helpers.js';

const ADMINISTRADOR = 3;
const TECNICO = 2;

async function rolDe(usuario) {
  const res = await pool.query('SELECT id_rol FROM usuarios WHERE id = $1', [usuario.id]);
  return res.rows[0].id_rol;
}

describe('roles: más de un administrador, sin quedarse nunca sin ninguno', () => {
  let admin, otro;

  beforeEach(async () => {
    await limpiarDatos();
    admin = await crearUsuario({ rol: 'administrador' });
    otro = await crearUsuario();
  });

  it('un administrador puede hacer administrador a otra persona, y queda en la auditoría', async () => {
    const res = await api().patch(`/api/usuarios/${otro.id}/rol`).set('Cookie', admin.cookie).send({ idRol: ADMINISTRADOR });

    expect(res.status).toBe(200);
    expect(await rolDe(otro)).toBe(ADMINISTRADOR);
    const auditoria = await pool.query("SELECT detalle FROM auditoria WHERE accion = 'CAMBIO_ROL'");
    expect(auditoria.rows[0].detalle).toBe(`Cambio de rol de ${otro.correo} -> administrador`);
  });

  it('un técnico no puede dar roles', async () => {
    const tecnico = await crearUsuario({ rol: 'tecnico' });

    const res = await api().patch(`/api/usuarios/${otro.id}/rol`).set('Cookie', tecnico.cookie).send({ idRol: ADMINISTRADOR });

    expect(res.status).toBe(403);
  });

  it('nadie puede cambiar su propio rol', async () => {
    const res = await api().patch(`/api/usuarios/${admin.id}/rol`).set('Cookie', admin.cookie).send({ idRol: TECNICO });

    expect(res.status).toBe(400);
    expect(await rolDe(admin)).toBe(ADMINISTRADOR);
  });

  it('con dos administradores, uno le puede sacar el rol al otro', async () => {
    const segundo = await crearUsuario({ rol: 'administrador' });

    const res = await api().patch(`/api/usuarios/${segundo.id}/rol`).set('Cookie', admin.cookie).send({ idRol: TECNICO });

    expect(res.status).toBe(200);
    expect(await rolDe(segundo)).toBe(TECNICO);
  });

  it('no se le saca el rol al único administrador activo (los deshabilitados no cuentan)', async () => {
    const segundo = await crearUsuario({ rol: 'administrador' });
    await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = $1', [admin.id]);
    // segundo es el único activo; el pedido lo hace un admin deshabilitado con sesión vieja
    const res = await api().patch(`/api/usuarios/${segundo.id}/rol`).set('Cookie', admin.cookie).send({ idRol: TECNICO });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/único administrador activo/);
    expect(await rolDe(segundo)).toBe(ADMINISTRADOR);
  });

  it('no se puede deshabilitar al único administrador activo', async () => {
    const segundo = await crearUsuario({ rol: 'administrador' });
    await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = $1', [admin.id]);

    const res = await api().patch(`/api/usuarios/${segundo.id}/activo`).set('Cookie', admin.cookie).send({ activo: false });

    expect(res.status).toBe(400);
  });

  it('con otro administrador activo, sí se puede deshabilitar a uno', async () => {
    const segundo = await crearUsuario({ rol: 'administrador' });

    const res = await api().patch(`/api/usuarios/${segundo.id}/activo`).set('Cookie', admin.cookie).send({ activo: false });

    expect(res.status).toBe(200);
  });

  it('rechaza un rol que no existe', async () => {
    const res = await api().patch(`/api/usuarios/${otro.id}/rol`).set('Cookie', admin.cookie).send({ idRol: 99 });

    expect(res.status).toBe(400);
  });
});
