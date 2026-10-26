import { describe, it, expect, beforeEach } from 'vitest';
import { api, crearUsuario, crearTicket, asignarTecnico, registrarEvento, limpiarDatos } from './helpers.js';

const pedir = (usuario, query = '') => api().get(`/api/notificaciones${query}`).set('Cookie', usuario.cookie);
const tipos = (res) => res.body.eventos.map((e) => e.tipo);

describe('GET /api/notificaciones', () => {
  let creador, otroUsuario, tecnico, otroTecnico, ticket;

  beforeEach(async () => {
    await limpiarDatos();
    creador = await crearUsuario();
    otroUsuario = await crearUsuario();
    tecnico = await crearUsuario({ rol: 'tecnico' });
    otroTecnico = await crearUsuario({ rol: 'tecnico' });
    ticket = await crearTicket(creador);
  });

  it('rechaza el pedido sin sesión', async () => {
    const res = await api().get('/api/notificaciones');
    expect(res.status).toBe(401);
  });

  describe('ticket nuevo', () => {
    it('les llega a los técnicos, con el nombre de quien lo creó', async () => {
      await registrarEvento(ticket, creador, 'CREACION', 'Ticket creado');

      const res = await pedir(tecnico);

      expect(res.status).toBe(200);
      expect(res.body.eventos).toHaveLength(1);
      expect(res.body.eventos[0]).toMatchObject({
        tipo: 'ticket_nuevo',
        titulo: 'Ticket nuevo',
        idTicket: ticket.id,
      });
      expect(res.body.eventos[0].mensaje).toBe(`${creador.nombre} ${creador.apellido} creó el ticket ${ticket.numero}: ${ticket.titulo}`);
    });

    it('no les llega a los usuarios comunes, ni siquiera al creador', async () => {
      await registrarEvento(ticket, creador, 'CREACION', 'Ticket creado');

      expect(tipos(await pedir(creador))).toEqual([]);
      expect(tipos(await pedir(otroUsuario))).toEqual([]);
    });

    it('un técnico no recibe el ticket que creó él mismo', async () => {
      const propio = await crearTicket(tecnico);
      await registrarEvento(propio, tecnico, 'CREACION', 'Ticket creado');

      expect(tipos(await pedir(tecnico))).toEqual([]);
      expect(tipos(await pedir(otroTecnico))).toEqual(['ticket_nuevo']);
    });
  });

  describe('asignado a mí', () => {
    it('le llega solo al técnico que quedó como responsable', async () => {
      await asignarTecnico(ticket, tecnico);
      await registrarEvento(ticket, otroTecnico, 'CAMBIO_RESPONSABLE', 'responsable');

      const res = await pedir(tecnico);

      expect(tipos(res)).toEqual(['asignado']);
      expect(res.body.eventos[0].mensaje).toBe(`${otroTecnico.nombre} ${otroTecnico.apellido} te asignó el ticket ${ticket.numero}: ${ticket.titulo}`);
      expect(tipos(await pedir(otroTecnico))).toEqual([]);
      expect(tipos(await pedir(creador))).toEqual([]);
    });

    it('no avisa cuando el técnico se asigna el ticket a sí mismo', async () => {
      await asignarTecnico(ticket, tecnico);
      await registrarEvento(ticket, tecnico, 'CAMBIO_RESPONSABLE', 'responsable');

      expect(tipos(await pedir(tecnico))).toEqual([]);
    });
  });

  describe('comentarios y cambios de estado', () => {
    beforeEach(async () => {
      await asignarTecnico(ticket, tecnico);
    });

    it('un comentario le llega al creador y al responsable, no a terceros', async () => {
      await registrarEvento(ticket, otroTecnico, 'COMENTARIO', 'comentario');

      expect(tipos(await pedir(creador))).toEqual(['comentario']);
      expect(tipos(await pedir(tecnico))).toEqual(['comentario']);
      expect(tipos(await pedir(otroUsuario))).toEqual([]);
    });

    it('quien comenta no recibe su propio comentario', async () => {
      await registrarEvento(ticket, creador, 'COMENTARIO', 'comentario');

      expect(tipos(await pedir(creador))).toEqual([]);
      expect(tipos(await pedir(tecnico))).toEqual(['comentario']);
    });

    it('un cambio de estado dice el estado nuevo', async () => {
      await registrarEvento(ticket, tecnico, 'CAMBIO_ESTADO', `Ticket ${ticket.numero}: estado -> Resuelto`);

      const res = await pedir(creador);

      expect(tipos(res)).toEqual(['estado']);
      expect(res.body.eventos[0].titulo).toBe('Cambio de estado');
      expect(res.body.eventos[0].mensaje).toBe(
        `${tecnico.nombre} ${tecnico.apellido} cambió el estado del ticket ${ticket.numero} a Resuelto: ${ticket.titulo}`
      );
    });

    it('un cierre llega como notificación de estado', async () => {
      await registrarEvento(ticket, tecnico, 'CIERRE', `Ticket ${ticket.numero}: cerrado`);

      const res = await pedir(creador);

      expect(tipos(res)).toEqual(['estado']);
      expect(res.body.eventos[0].titulo).toBe('Ticket cerrado');
      expect(res.body.eventos[0].mensaje).toBe(`${tecnico.nombre} ${tecnico.apellido} cerró el ticket ${ticket.numero}: ${ticket.titulo}`);
    });

    it('los eventos que no son notificaciones (prioridad, adjuntos, tareas) se ignoran', async () => {
      await registrarEvento(ticket, otroTecnico, 'CAMBIO_PRIORIDAD', 'prioridad');
      await registrarEvento(ticket, otroTecnico, 'ADJUNTO_AGREGADO', 'adjunto');
      await registrarEvento(ticket, otroTecnico, 'TAREA_CREADA', 'tarea');

      expect(tipos(await pedir(creador))).toEqual([]);
    });
  });

  describe('texto para leer en voz alta', () => {
    it('dice el número del ticket como número, sin el prefijo ni los ceros', async () => {
      await registrarEvento(ticket, creador, 'CREACION', 'Ticket creado');

      const res = await pedir(tecnico);
      const numero = Number(ticket.numero.replace('TK-', ''));

      expect(res.body.eventos[0].mensajeVoz).toBe(`${creador.nombre} ${creador.apellido} creó el ticket número ${numero}: ${ticket.titulo}`);
    });
  });

  describe('cursor y límite', () => {
    it('devuelve primero lo más nuevo y el id del último evento registrado', async () => {
      const primero = await registrarEvento(ticket, creador, 'CREACION', 'creado');
      const segundo = await registrarEvento(ticket, otroTecnico, 'COMENTARIO', 'comentario');
      await asignarTecnico(ticket, tecnico);

      const res = await pedir(tecnico);

      expect(res.body.eventos.map((e) => e.id)).toEqual([segundo.id, primero.id]);
      expect(res.body.ultimoId).toBe(segundo.id);
    });

    it('con despuesDe solo trae lo posterior', async () => {
      await asignarTecnico(ticket, tecnico);
      const primero = await registrarEvento(ticket, otroTecnico, 'COMENTARIO', 'uno');
      const segundo = await registrarEvento(ticket, otroTecnico, 'COMENTARIO', 'dos');

      const res = await pedir(tecnico, `?despuesDe=${primero.id}`);

      expect(res.body.eventos.map((e) => e.id)).toEqual([segundo.id]);
    });

    it('el último id cuenta aunque el último evento no sea para este usuario', async () => {
      await asignarTecnico(ticket, tecnico);
      await registrarEvento(ticket, otroTecnico, 'COMENTARIO', 'para el técnico');
      const ajeno = await registrarEvento(ticket, otroTecnico, 'ADJUNTO_AGREGADO', 'no es notificación');

      const res = await pedir(tecnico);

      expect(res.body.ultimoId).toBe(ajeno.id);
    });

    it('sin eventos el último id es 0', async () => {
      const res = await pedir(tecnico);
      expect(res.body).toEqual({ eventos: [], ultimoId: 0 });
    });

    it('respeta el límite pedido', async () => {
      await asignarTecnico(ticket, tecnico);
      for (let i = 0; i < 5; i += 1) await registrarEvento(ticket, otroTecnico, 'COMENTARIO', `c${i}`);

      const res = await pedir(tecnico, '?limite=2');

      expect(res.body.eventos).toHaveLength(2);
    });

    it('rechaza un despuesDe que no es un número', async () => {
      const res = await pedir(tecnico, '?despuesDe=abc');
      expect(res.status).toBe(400);
    });
  });
});
