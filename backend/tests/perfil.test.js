import { describe, it, expect, beforeEach } from 'vitest';
import { pool } from '../config/db.js';
import { api, crearUsuario, limpiarDatos } from './helpers.js';

describe('editar el propio nombre y apellido', () => {
  let usuario;

  beforeEach(async () => {
    await limpiarDatos();
    usuario = await crearUsuario();
  });

  it('rechaza el pedido sin sesión', async () => {
    const res = await api().put('/api/usuarios/perfil').send({ nombre: 'Ana', apellido: 'Pérez' });
    expect(res.status).toBe(401);
  });

  it('guarda los datos sin espacios de más y lo registra en la auditoría', async () => {
    const res = await api()
      .put('/api/usuarios/perfil')
      .set('Cookie', usuario.cookie)
      .send({ nombre: '  Ana María ', apellido: ' Pérez ' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: usuario.id, nombre: 'Ana María', apellido: 'Pérez', correo: usuario.correo });
    expect(res.body.password_hash).toBeUndefined();

    const perfil = await api().get('/api/usuarios/perfil').set('Cookie', usuario.cookie);
    expect(perfil.body).toMatchObject({ nombre: 'Ana María', apellido: 'Pérez' });

    const auditoria = await pool.query("SELECT id_usuario, detalle FROM auditoria WHERE accion = 'CAMBIO_DATOS_PERFIL'");
    expect(auditoria.rows).toEqual([
      {
        id_usuario: usuario.id,
        detalle: `Nombre: ${usuario.nombre} ${usuario.apellido} -> Ana María Pérez (${usuario.correo})`,
      },
    ]);
  });

  it('no acepta nombre o apellido vacíos', async () => {
    const res = await api().put('/api/usuarios/perfil').set('Cookie', usuario.cookie).send({ nombre: '   ', apellido: 'Pérez' });

    expect(res.status).toBe(400);
    const perfil = await api().get('/api/usuarios/perfil').set('Cookie', usuario.cookie);
    expect(perfil.body.nombre).toBe(usuario.nombre);
  });

  it('no acepta más de 100 caracteres', async () => {
    const res = await api()
      .put('/api/usuarios/perfil')
      .set('Cookie', usuario.cookie)
      .send({ nombre: 'A'.repeat(101), apellido: 'Pérez' });

    expect(res.status).toBe(400);
  });
});
