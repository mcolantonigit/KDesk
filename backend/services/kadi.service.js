import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as usuariosModel from '../models/usuarios.model.js';
import * as sucursalesModel from '../models/sucursales.model.js';
import * as sectoresModel from '../models/sectores.model.js';
import * as prioridadesModel from '../models/prioridades.model.js';
import * as tiposTicketModel from '../models/tiposTicket.model.js';
import { ejecutarClaude } from '../utils/claudeLocal.util.js';

const INSTRUCCIONES = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '../kadi/instrucciones.md'),
  'utf8'
);

const MAX_MENSAJES_PERSONA = 10;
const LARGO_MAXIMO_MENSAJE = 1000;
const TITULO_LONGITUD_MAXIMA = 35;

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

// Kadi con Claude corre con la sesión personal de quien tiene Claude Code
// instalado. KADI_ACTIVA=on es el interruptor general (solo en desarrollo; en
// producción queda sin definir) y, con él prendido, la habilita cada usuario
// desde "Usuarios y permisos" (columna kadi_habilitada).
export function kadiActiva() {
  return process.env.KADI_ACTIVA === 'on';
}

export async function estaHabilitada(idUsuario) {
  if (!kadiActiva()) return false;
  const usuario = await usuariosModel.findById(idUsuario);
  return Boolean(usuario?.kadi_habilitada);
}

function validarMensajes(mensajes) {
  if (!Array.isArray(mensajes) || mensajes.length === 0) {
    throw crearError('Falta la conversación', 400);
  }
  const limpios = mensajes.map((mensaje) => ({
    rol: mensaje?.rol === 'kadi' ? 'kadi' : 'persona',
    texto: String(mensaje?.texto ?? '').trim().slice(0, LARGO_MAXIMO_MENSAJE),
  }));
  if (limpios.at(-1).rol !== 'persona' || !limpios.at(-1).texto) {
    throw crearError('El último mensaje tiene que ser de la persona', 400);
  }
  const deLaPersona = limpios.filter((mensaje) => mensaje.rol === 'persona').length;
  if (deLaPersona > MAX_MENSAJES_PERSONA) {
    throw crearError('La charla llegó al límite de mensajes: usá el formulario', 400);
  }
  return { limpios, deLaPersona };
}

function listaParaClaude(titulo, filas) {
  return `### ${titulo}\n${filas.map((fila) => `- id ${fila.id}: ${fila.nombre}`).join('\n')}`;
}

async function armarSistema(usuario, tipos, prioridades, deLaPersona) {
  const sucursal = await sucursalesModel.findById(usuario.id_sucursal);
  const sector = await sectoresModel.findById(usuario.id_sector);
  return [
    INSTRUCCIONES,
    '## Datos de la persona',
    `Nombre: ${usuario.nombre} ${usuario.apellido}. Sucursal: ${sucursal?.nombre ?? '—'}. Sector: ${sector?.nombre ?? '—'}.`,
    '## Listas',
    listaParaClaude('Tipos de ticket', tipos),
    listaParaClaude('Prioridades (de la más alta a la más baja)', prioridades),
    `## Estado de la charla\nLa persona lleva ${deLaPersona} de ${MAX_MENSAJES_PERSONA} mensajes.${
      deLaPersona >= MAX_MENSAJES_PERSONA - 2 ? ' Cerrá ya: armá el ticket con lo que tengas.' : ''
    }`,
  ].join('\n\n');
}

function leerRespuesta(texto) {
  const inicio = texto.indexOf('{');
  const fin = texto.lastIndexOf('}');
  if (inicio === -1 || fin <= inicio) return { mensaje: texto.trim(), ticket: null };
  try {
    const dato = JSON.parse(texto.slice(inicio, fin + 1));
    return { mensaje: String(dato.mensaje ?? '').trim(), ticket: dato.ticket ?? null };
  } catch {
    return { mensaje: texto.trim(), ticket: null };
  }
}

// El ticket que arma Kadi es solo una propuesta: se valida contra los
// catálogos y recién se crea cuando la persona confirma (POST /api/tickets).
function validarTicket(ticket, tipos, prioridades) {
  if (!ticket) return null;
  const tipo = tipos.find((item) => item.id === Number(ticket.idTipo));
  const prioridad = prioridades.find((item) => item.id === Number(ticket.idPrioridadSugerida));
  const titulo = String(ticket.titulo ?? '').trim().slice(0, TITULO_LONGITUD_MAXIMA);
  const descripcion = String(ticket.descripcion ?? '').trim();
  if (!tipo || !prioridad || !titulo || !descripcion) return null;
  return {
    idTipo: tipo.id,
    tipo: tipo.nombre,
    idPrioridadSugerida: prioridad.id,
    prioridad: prioridad.nombre,
    titulo,
    descripcion,
  };
}

export async function conversar({ idUsuario, mensajes }) {
  if (!(await estaHabilitada(idUsuario))) {
    throw crearError('Kadi no está habilitada para tu usuario', 403);
  }
  const { limpios, deLaPersona } = validarMensajes(mensajes);

  const usuario = await usuariosModel.findById(idUsuario);
  const tipos = (await tiposTicketModel.findAll()).filter((tipo) => tipo.activo);
  const prioridades = (await prioridadesModel.findAll()).filter((prioridad) => prioridad.activo);

  const sistema = await armarSistema(usuario, tipos, prioridades, deLaPersona);
  const conversacion = [
    'Charla hasta ahora:',
    ...limpios.map((mensaje) => `${mensaje.rol === 'kadi' ? 'Kadi' : 'Persona'}: ${mensaje.texto}`),
    '',
    'Respondé ahora como Kadi, solo con el JSON.',
  ].join('\n');

  let respuesta;
  try {
    respuesta = await ejecutarClaude({ sistema, conversacion });
  } catch (error) {
    throw crearError(`Kadi no pudo responder: ${error.message}`, 502);
  }

  const { mensaje, ticket } = leerRespuesta(respuesta);
  const ticketValido = validarTicket(ticket, tipos, prioridades);
  if (ticket && !ticketValido) {
    return { mensaje: 'Me faltó algún dato para armar el ticket. ¿Podés contarme un poco más?', ticket: null };
  }
  return { mensaje: mensaje || 'No te entendí bien, ¿me lo contás de otra forma?', ticket: ticketValido };
}
