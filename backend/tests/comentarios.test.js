import { describe, it, expect, beforeEach } from 'vitest';
import { api, crearUsuario, crearTicket, limpiarDatos } from './helpers.js';

describe('comentarios de un ticket', () => {
  let creador, otro, tecnico, ticket;

  beforeEach(async () => {
    await limpiarDatos();
    creador = await crearUsuario();
    otro = await crearUsuario();
    tecnico = await crearUsuario({ rol: 'tecnico' });
    ticket = await crearTicket(creador);
  });

  it('rechaza el pedido sin sesión', async () => {
    const res = await api().get(`/api/tickets/${ticket.id}/comentarios`);
    expect(res.status).toBe(401);
  });

  it('el creador del ticket puede comentar y queda registrado como autor', async () => {
    const res = await api()
      .post(`/api/tickets/${ticket.id}/comentarios`)
      .set('Cookie', creador.cookie)
      .send({ contenido: 'Hola, sigue sin imprimir' });

    expect(res.status).toBe(201);
    expect(res.body.contenido).toBe('Hola, sigue sin imprimir');
    expect(res.body.id_autor).toBe(creador.id);
  });

  it('no acepta un comentario vacío', async () => {
    const res = await api()
      .post(`/api/tickets/${ticket.id}/comentarios`)
      .set('Cookie', creador.cookie)
      .send({ contenido: '   ' });

    expect(res.status).toBe(400);
  });

  it('un usuario común no puede ver ni comentar el ticket de otro', async () => {
    const listar = await api().get(`/api/tickets/${ticket.id}/comentarios`).set('Cookie', otro.cookie);
    const crear = await api()
      .post(`/api/tickets/${ticket.id}/comentarios`)
      .set('Cookie', otro.cookie)
      .send({ contenido: 'intruso' });

    expect(listar.status).toBe(403);
    expect(crear.status).toBe(403);
  });

  it('un técnico puede comentar en cualquier ticket y el listado viene en orden', async () => {
    await api().post(`/api/tickets/${ticket.id}/comentarios`).set('Cookie', creador.cookie).send({ contenido: 'primero' });
    await api().post(`/api/tickets/${ticket.id}/comentarios`).set('Cookie', tecnico.cookie).send({ contenido: 'segundo' });

    const res = await api().get(`/api/tickets/${ticket.id}/comentarios`).set('Cookie', tecnico.cookie);

    expect(res.status).toBe(200);
    expect(res.body.map((c) => c.contenido)).toEqual(['primero', 'segundo']);
  });

  it('el listado incluye el nombre y apellido de quien cargó cada comentario', async () => {
    await api().post(`/api/tickets/${ticket.id}/comentarios`).set('Cookie', creador.cookie).send({ contenido: 'del creador' });
    await api().post(`/api/tickets/${ticket.id}/comentarios`).set('Cookie', tecnico.cookie).send({ contenido: 'del técnico' });

    const res = await api().get(`/api/tickets/${ticket.id}/comentarios`).set('Cookie', tecnico.cookie);

    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ id_autor: creador.id, autor_nombre: creador.nombre, autor_apellido: creador.apellido });
    expect(res.body[1]).toMatchObject({ id_autor: tecnico.id, autor_nombre: tecnico.nombre, autor_apellido: tecnico.apellido });
  });

  it('solo el autor o un técnico pueden eliminar un comentario', async () => {
    const creado = await api()
      .post(`/api/tickets/${ticket.id}/comentarios`)
      .set('Cookie', creador.cookie)
      .send({ contenido: 'borrame' });
    const id = creado.body.id;

    const ajeno = await api().delete(`/api/comentarios/${id}`).set('Cookie', otro.cookie);
    const propio = await api().delete(`/api/comentarios/${id}`).set('Cookie', creador.cookie);
    const repetido = await api().delete(`/api/comentarios/${id}`).set('Cookie', tecnico.cookie);

    expect(ajeno.status).toBe(403);
    expect(propio.status).toBe(200);
    expect(propio.body.eliminado).toBe(true);
    expect(repetido.status).toBe(400);
  });
});
