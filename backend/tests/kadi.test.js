import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pool } from '../config/db.js';
import { ejecutarClaude } from '../utils/claudeLocal.util.js';
import { api, crearUsuario, limpiarDatos } from './helpers.js';

vi.mock('../utils/claudeLocal.util.js', () => ({ ejecutarClaude: vi.fn() }));

const persona = (texto) => ({ rol: 'persona', texto });

describe('Kadi', () => {
  let usuario, otro, tipo, prioridad;

  beforeEach(async () => {
    await limpiarDatos();
    usuario = await crearUsuario();
    otro = await crearUsuario();
    process.env.KADI_USUARIOS = usuario.correo.toUpperCase();
    tipo = (await pool.query('SELECT id, nombre FROM tipos_ticket WHERE activo ORDER BY id LIMIT 1')).rows[0];
    prioridad = (await pool.query('SELECT id, nombre FROM prioridades WHERE activo ORDER BY id LIMIT 1')).rows[0];
    ejecutarClaude.mockReset();
  });

  afterEach(() => {
    delete process.env.KADI_USUARIOS;
  });

  it('solo está habilitada para los correos de KADI_USUARIOS', async () => {
    const propia = await api().get('/api/kadi/estado').set('Cookie', usuario.cookie);
    const ajena = await api().get('/api/kadi/estado').set('Cookie', otro.cookie);

    expect(propia.body).toEqual({ habilitada: true });
    expect(ajena.body).toEqual({ habilitada: false });

    const intento = await api().post('/api/kadi/mensaje').set('Cookie', otro.cookie).send({ mensajes: [persona('hola')] });
    expect(intento.status).toBe(403);
    expect(ejecutarClaude).not.toHaveBeenCalled();
  });

  it('sin KADI_USUARIOS está apagada para todos', async () => {
    process.env.KADI_USUARIOS = '';

    const res = await api().get('/api/kadi/estado').set('Cookie', usuario.cookie);

    expect(res.body).toEqual({ habilitada: false });
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

  it('si Claude falla avisa con 502, y si la charla se pasa de 10 mensajes la corta', async () => {
    ejecutarClaude.mockRejectedValue(new Error('se cayó'));
    const caido = await api().post('/api/kadi/mensaje').set('Cookie', usuario.cookie).send({ mensajes: [persona('hola')] });
    expect(caido.status).toBe(502);

    const largo = Array.from({ length: 11 }, () => persona('seguimos'));
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
