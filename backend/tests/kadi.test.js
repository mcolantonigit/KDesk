import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pool } from '../config/db.js';
import { ejecutarClaude } from '../utils/claudeLocal.util.js';
import * as usuariosModel from '../models/usuarios.model.js';
import { api, crearUsuario, limpiarDatos } from './helpers.js';

vi.mock('../utils/claudeLocal.util.js', () => ({ ejecutarClaude: vi.fn() }));

const persona = (texto) => ({ rol: 'persona', texto });

describe('Kadi', () => {
  let usuario, otro, admin, tipo, prioridad;

  beforeEach(async () => {
    await limpiarDatos();
    usuario = await crearUsuario();
    otro = await crearUsuario();
    admin = await crearUsuario({ rol: 'administrador' });
    process.env.KADI_ACTIVA = 'on';
    await pool.query('UPDATE usuarios SET kadi_habilitada = TRUE WHERE id = $1', [usuario.id]);
    tipo = (await pool.query('SELECT id, nombre FROM tipos_ticket WHERE activo ORDER BY id LIMIT 1')).rows[0];
    prioridad = (await pool.query('SELECT id, nombre FROM prioridades WHERE activo ORDER BY id LIMIT 1')).rows[0];
    ejecutarClaude.mockReset();
  });

  afterEach(() => {
    delete process.env.KADI_ACTIVA;
  });

  it('solo está habilitada para los usuarios que la tienen habilitada', async () => {
    const propia = await api().get('/api/kadi/estado').set('Cookie', usuario.cookie);
    const ajena = await api().get('/api/kadi/estado').set('Cookie', otro.cookie);

    expect(propia.body).toEqual({ habilitada: true, activa: true });
    expect(ajena.body).toEqual({ habilitada: false, activa: true });

    const intento = await api().post('/api/kadi/mensaje').set('Cookie', otro.cookie).send({ mensajes: [persona('hola')] });
    expect(intento.status).toBe(403);
    expect(ejecutarClaude).not.toHaveBeenCalled();
  });

  it('sin el interruptor general (KADI_ACTIVA) está apagada para todos, aunque el usuario la tenga', async () => {
    delete process.env.KADI_ACTIVA;

    const res = await api().get('/api/kadi/estado').set('Cookie', usuario.cookie);
    const intento = await api().post('/api/kadi/mensaje').set('Cookie', usuario.cookie).send({ mensajes: [persona('hola')] });

    expect(res.body).toEqual({ habilitada: false, activa: false });
    expect(intento.status).toBe(403);
  });

  it('un administrador habilita y deshabilita Kadi para un usuario, y queda auditado', async () => {
    const habilita = await api().patch(`/api/usuarios/${otro.id}/kadi`).set('Cookie', admin.cookie).send({ habilitada: true });
    expect(habilita.status).toBe(200);
    expect(habilita.body.kadi_habilitada).toBe(true);
    const estado = await api().get('/api/kadi/estado').set('Cookie', otro.cookie);
    expect(estado.body.habilitada).toBe(true);

    const deshabilita = await api().patch(`/api/usuarios/${otro.id}/kadi`).set('Cookie', admin.cookie).send({ habilitada: false });
    expect(deshabilita.body.kadi_habilitada).toBe(false);

    const auditoria = await pool.query("SELECT detalle FROM auditoria WHERE accion = 'CAMBIO_KADI' ORDER BY id");
    expect(auditoria.rows.map((fila) => fila.detalle)).toEqual([
      `Habilitación de Kadi para ${otro.correo}`,
      `Deshabilitación de Kadi para ${otro.correo}`,
    ]);
  });

  it('solo un administrador puede cambiarlo, y pide un valor válido', async () => {
    const comun = await api().patch(`/api/usuarios/${otro.id}/kadi`).set('Cookie', usuario.cookie).send({ habilitada: true });
    expect(comun.status).toBe(403);

    const invalido = await api().patch(`/api/usuarios/${otro.id}/kadi`).set('Cookie', admin.cookie).send({ habilitada: 'si' });
    expect(invalido.status).toBe(400);

    const inexistente = await api().patch('/api/usuarios/999999/kadi').set('Cookie', admin.cookie).send({ habilitada: true });
    expect(inexistente.status).toBe(404);
  });

  it('las cuentas nuevas nacen con Kadi habilitada', async () => {
    const datos = async (correo) => ({
      nombre: 'Nueva',
      apellido: 'Cuenta',
      correo,
      passwordHash: 'x',
      idRol: 1,
      idSucursal: (await pool.query('SELECT id FROM sucursales ORDER BY id LIMIT 1')).rows[0].id,
      idSector: (await pool.query('SELECT id FROM sectores ORDER BY id LIMIT 1')).rows[0].id,
    });

    const nueva = await usuariosModel.create(await datos('nueva@tuempresa.com'));

    expect(nueva.kadi_habilitada).toBe(true);
  });

  it('el listado de usuarios informa quién tiene Kadi', async () => {
    const res = await api().get('/api/usuarios').set('Cookie', admin.cookie);

    const porId = Object.fromEntries(res.body.map((fila) => [fila.id, fila.kadi_habilitada]));
    expect(porId[usuario.id]).toBe(true);
    expect(porId[otro.id]).toBe(false);
  });

  it('exige sesión', async () => {
    const res = await api().post('/api/kadi/mensaje').send({ mensajes: [persona('hola')] });

    expect(res.status).toBe(401);
  });

  it('responde con el mensaje de Kadi y le pasa los catálogos y los datos de la persona', async () => {
    ejecutarClaude.mockResolvedValue('{"mensaje": "¿Qué te pasó?", "ticket": null}');

    const res = await api().post('/api/kadi/mensaje').set('Cookie', usuario.cookie).send({ mensajes: [persona('Hola')] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ mensaje: '¿Qué te pasó?', ticket: null });
    const { sistema, conversacion } = ejecutarClaude.mock.calls[0][0];
    expect(sistema).toContain(`id ${tipo.id}: ${tipo.nombre}`);
    expect(sistema).toContain(`id ${prioridad.id}: ${prioridad.nombre}`);
    expect(sistema).toContain(`${usuario.nombre} ${usuario.apellido}`);
    expect(conversacion).toContain('Persona: Hola');
  });

  it('Kadi indaga con preguntas de observación pero sin dar diagnóstico, y se le pide cerrar al pasar la meta de 15', async () => {
    ejecutarClaude.mockResolvedValue('{"mensaje": "ok", "ticket": null}');
    const charla = (n) => Array.from({ length: n }, (_, i) => persona(`mensaje ${i}`));

    await api().post('/api/kadi/mensaje').set('Cookie', usuario.cookie).send({ mensajes: charla(3) });
    await api().post('/api/kadi/mensaje').set('Cookie', usuario.cookie).send({ mensajes: charla(16) });
    await api().post('/api/kadi/mensaje').set('Cookie', usuario.cookie).send({ mensajes: charla(48) });

    const [corta, pasadaLaMeta, casiEnElTope] = ejecutarClaude.mock.calls.map(([datos]) => datos.sistema);
    expect(corta).toContain('Indagá un poco más');
    expect(corta).toContain('Jamás');
    expect(corta).toContain('luz de link');
    expect(corta).toContain('Posible diagnóstico:');
    expect(corta).not.toContain('Ya pasaste la meta');
    expect(pasadaLaMeta).toContain('Ya pasaste la meta');
    expect(casiEnElTope).toContain('Cerrá ya');
  });

  it('devuelve el ticket propuesto con los nombres, y el título recortado a 35', async () => {
    const titulo = 'Impresora de la planta que no imprime nada de nada';
    ejecutarClaude.mockResolvedValue(
      'Acá va:\n' +
        JSON.stringify({
          mensaje: 'Revisá y confirmá.',
          ticket: { idTipo: tipo.id, idPrioridadSugerida: prioridad.id, titulo, descripcion: 'No imprime desde ayer' },
        })
    );

    const res = await api().post('/api/kadi/mensaje').set('Cookie', usuario.cookie).send({ mensajes: [persona('no imprime')] });

    expect(res.body.ticket).toEqual({
      idTipo: tipo.id,
      tipo: tipo.nombre,
      idPrioridadSugerida: prioridad.id,
      prioridad: prioridad.nombre,
      titulo: titulo.slice(0, 35),
      descripcion: 'No imprime desde ayer',
    });
  });

  it('descarta un ticket con un tipo o una prioridad que no existen', async () => {
    ejecutarClaude.mockResolvedValue(
      JSON.stringify({ mensaje: 'Listo', ticket: { idTipo: 99999, idPrioridadSugerida: prioridad.id, titulo: 'x', descripcion: 'y' } })
    );

    const res = await api().post('/api/kadi/mensaje').set('Cookie', usuario.cookie).send({ mensajes: [persona('hola')] });

    expect(res.body.ticket).toBeNull();
  });

  it('si Claude falla avisa con 502, y si la charla se pasa de 50 mensajes la corta', async () => {
    ejecutarClaude.mockRejectedValue(new Error('se cayó'));
    const caido = await api().post('/api/kadi/mensaje').set('Cookie', usuario.cookie).send({ mensajes: [persona('hola')] });
    expect(caido.status).toBe(502);

    const largo = Array.from({ length: 51 }, () => persona('seguimos'));
    const res = await api().post('/api/kadi/mensaje').set('Cookie', usuario.cookie).send({ mensajes: largo });
    expect(res.status).toBe(400);
  });

  it('el último mensaje tiene que ser de la persona', async () => {
    const res = await api()
      .post('/api/kadi/mensaje')
      .set('Cookie', usuario.cookie)
      .send({ mensajes: [persona('hola'), { rol: 'kadi', texto: 'hola!' }] });

    expect(res.status).toBe(400);
  });
});
