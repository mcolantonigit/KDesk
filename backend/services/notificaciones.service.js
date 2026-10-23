import * as notificacionesModel from '../models/notificaciones.model.js';
import * as rolesService from './roles.service.js';

const LIMITE_POR_DEFECTO = 30;
const LIMITE_MAXIMO = 100;

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

function enteroNoNegativo(valor, porDefecto, nombre) {
  if (valor === undefined) return porDefecto;
  if (!/^\d+$/.test(String(valor))) {
    throw crearError(`${nombre} debe ser un número entero`, 400);
  }
  return Number(valor);
}

// Arma el texto de un evento. Hay dos versiones: la que se lee en pantalla
// ("TK-000192") y la que se dice en voz alta ("ticket número 192").
function describir(evento) {
  const actor = `${evento.actor_nombre ?? ''} ${evento.actor_apellido ?? ''}`.trim() || 'Alguien';
  const numeroVoz = `número ${Number(evento.numero.replace(/\D/g, ''))}`;
  const frase = (accion, pantalla = '', voz = '') => ({
    mensaje: `${actor} ${accion} ${evento.numero}${pantalla}: ${evento.titulo}`,
    mensajeVoz: `${actor} ${accion} ${numeroVoz}${voz}: ${evento.titulo}`,
  });

  switch (evento.evento) {
    case 'CREACION':
      return { tipo: 'ticket_nuevo', titulo: 'Ticket nuevo', ...frase('creó el ticket') };
    case 'CAMBIO_RESPONSABLE':
      return { tipo: 'asignado', titulo: 'Ticket asignado', ...frase('te asignó el ticket') };
    case 'COMENTARIO':
      return { tipo: 'comentario', titulo: 'Comentario nuevo', ...frase('comentó en el ticket') };
    case 'CIERRE':
      return { tipo: 'estado', titulo: 'Ticket cerrado', ...frase('cerró el ticket') };
    case 'CAMBIO_ESTADO': {
      // El historial guarda "Ticket TK-000001: estado -> Resuelto"
      const estadoNuevo = /estado -> (.+)$/.exec(evento.detalle ?? '')?.[1];
      const sufijo = estadoNuevo ? ` a ${estadoNuevo}` : '';
      return { tipo: 'estado', titulo: 'Cambio de estado', ...frase('cambió el estado del ticket', sufijo, sufijo) };
    }
    default:
      return null;
  }
}

export async function obtenerNotificaciones({ usuario, despuesDe, limite }) {
  const cursor = enteroNoNegativo(despuesDe, 0, 'despuesDe');
  const cantidad = Math.min(enteroNoNegativo(limite, LIMITE_POR_DEFECTO, 'limite'), LIMITE_MAXIMO);

  const esTecnico = await rolesService.esRolTecnicoOAdministrador(usuario.idRol);
  const [filas, ultimoId] = await Promise.all([
    notificacionesModel.findParaUsuario({ idUsuario: usuario.id, esTecnico, despuesDe: cursor, limite: cantidad }),
    notificacionesModel.findUltimoId(),
  ]);

  const eventos = filas.map((fila) => ({
    id: fila.id,
    idTicket: fila.id_ticket,
    fecha: fila.fecha,
    ...describir(fila),
  }));

  return { eventos, ultimoId };
}
