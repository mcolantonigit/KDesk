import { describe, it, expect, beforeEach } from 'vitest';
import { pool } from '../config/db.js';
import { api, crearUsuario, crearTicket, asignarTecnico, limpiarDatos } from './helpers.js';

async function idTipo(nombre) {
  const res = await pool.query('SELECT id FROM tipos_ticket WHERE nombre = $1', [nombre]);
  return res.rows[0].id;
}

describe('editar un ticket', () => {
  let creador, tecnico, ticket;

  beforeEach(async () => {
    await limpiarDatos();
    creador = await crearUsuario();
    tecnico = await crearUsuario({ rol: 'tecnico' });
    ticket = await crearTicket(creador);
  });

  it('un técnico cambia el tipo y queda en el historial y en la auditoría', async () => {
    const idOtro = await idTipo('Otro');

    const res = await api()
      .patch(`/api/tickets/${ticket.id}/tipo`)
      .set('Cookie', tecnico.cookie)
      .send({ idTipo: idOtro });

    expect(res.status).toBe(200);
    expect(res.body.id_tipo).toBe(idOtro);

    const historial = await pool.query('SELECT evento, detalle, id_usuario FROM historial_ticket WHERE id_ticket = $1', [ticket.id]);
    expect(historial.rows).toEqual([
      { evento: 'CAMBIO_TIPO', detalle: `Ticket ${ticket.numero}: tipo -> Otro`, id_usuario: tecnico.id },
    ]);
    const auditoria = await pool.query("SELECT detalle FROM auditoria WHERE accion = 'CAMBIO_TIPO'");
    expect(auditoria.rows).toEqual([{ detalle: `Ticket ${ticket.numero}: tipo -> Otro` }]);
  });

  it('un usuario común no puede cambiar el tipo, ni siquiera de su propio ticket', async () => {
    const res = await api()
      .patch(`/api/tickets/${ticket.id}/tipo`)
      .set('Cookie', creador.cookie)
      .send({ idTipo: await idTipo('Otro') });

    expect(res.status).toBe(403);
  });

  it('rechaza un tipo que no existe', async () => {
    const res = await api().patch(`/api/tickets/${ticket.id}/tipo`).set('Cookie', tecnico.cookie).send({ idTipo: 9999 });

    expect(res.status).toBe(400);
  });

  it('el detalle trae el nombre del responsable, también para el creador del ticket', async () => {
    const sinAsignar = await api().get(`/api/tickets/${ticket.id}`).set('Cookie', creador.cookie);
    expect(sinAsignar.body.tecnico_responsable).toBeNull();

    await asignarTecnico(ticket, tecnico);
    const res = await api().get(`/api/tickets/${ticket.id}`).set('Cookie', creador.cookie);

    expect(res.status).toBe(200);
    expect(res.body.tecnico_responsable).toBe(`${tecnico.nombre} ${tecnico.apellido}`);
  });
});
