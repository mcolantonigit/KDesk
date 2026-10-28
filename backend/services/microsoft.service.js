import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import * as usuariosService from './usuarios.service.js';
import * as sucursalesModel from '../models/sucursales.model.js';
import * as sectoresModel from '../models/sectores.model.js';

// Login con cuentas de Microsoft 365 (Entra ID), por OpenID Connect con
// "authorization code" + PKCE. La app está registrada como multi-organización,
// pero solo se aceptan los tenants de M365_TENANTS y los correos de M365_DOMINIOS.
//
// El id_token se recibe directo del endpoint de tokens de Microsoft, servidor a
// servidor por HTTPS y autenticado con el secreto de la app: según OpenID Connect
// (Core 3.1.3.7) en ese caso alcanza con validar el TLS en lugar de la firma.
// Igual se controlan audiencia, emisor, tenant, vencimiento y nonce.

const AUTORIZAR_URL = 'https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize';
const TOKEN_URL = 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token';
const SCOPES = 'openid profile email';
const MINUTOS_INTENTO = 10;
const MINUTOS_ALTA = 15;
const NOMBRE_LONGITUD_MAXIMA = 100;

function crearError(mensaje, status, codigo) {
  const error = new Error(mensaje);
  error.status = status;
  error.codigo = codigo;
  return error;
}

function lista(valor) {
  return (valor ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function config() {
  return {
    clientId: process.env.M365_CLIENT_ID,
    clientSecret: process.env.M365_CLIENT_SECRET,
    tenants: lista(process.env.M365_TENANTS),
    dominios: lista(process.env.M365_DOMINIOS),
  };
}

export function habilitado() {
  const { clientId, clientSecret, tenants, dominios } = config();
  return Boolean(clientId && clientSecret && tenants.length && dominios.length);
}

// A dónde volver después del login: solo a un frontend conocido (el de
// FRONTEND_URL o alguno de CORS_ORIGINS), nunca a una dirección cualquiera.
export function frontendDeVuelta(pedido) {
  const permitidos = [...lista(process.env.CORS_ORIGINS)];
  try {
    permitidos.unshift(new URL(process.env.FRONTEND_URL).origin.toLowerCase());
  } catch {
    // FRONTEND_URL vacío o inválido: solo quedan los de CORS_ORIGINS
  }
  const normalizado = (pedido ?? '').trim().replace(/\/+$/, '').toLowerCase();
  return permitidos.includes(normalizado) ? normalizado : permitidos[0];
}

function base64url(buffer) {
  return buffer.toString('base64url');
}

// Arma la redirección a Microsoft y el estado que hay que recordar (en una
// cookie firmada) para validar la vuelta.
export function iniciar({ redirectUri, volver }) {
  if (!habilitado()) {
    throw crearError('El inicio de sesión con Microsoft 365 no está configurado', 503);
  }

  const estado = base64url(crypto.randomBytes(24));
  const nonce = base64url(crypto.randomBytes(24));
  const verificador = base64url(crypto.randomBytes(32));
  const desafio = base64url(crypto.createHash('sha256').update(verificador).digest());

  const url = new URL(AUTORIZAR_URL);
  url.search = new URLSearchParams({
    client_id: config().clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    response_mode: 'query',
    scope: SCOPES,
    state: estado,
    nonce,
    code_challenge: desafio,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();

  const cookie = jwt.sign({ estado, nonce, verificador, volver, redirectUri }, process.env.JWT_SECRET, {
    expiresIn: `${MINUTOS_INTENTO}m`,
  });

  return { url: url.toString(), cookie, maxAgeMs: MINUTOS_INTENTO * 60 * 1000 };
}

export function leerIntento(cookie) {
  try {
    return jwt.verify(cookie, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function decodificarIdToken(idToken) {
  const partes = (idToken ?? '').split('.');
  if (partes.length !== 3) {
    throw crearError('Respuesta inválida de Microsoft', 502, 'microsoft');
  }
  return JSON.parse(Buffer.from(partes[1], 'base64url').toString('utf8'));
}

async function pedirIdToken({ code, intento }) {
  const { clientId, clientSecret } = config();
  const respuesta = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: intento.redirectUri,
      code_verifier: intento.verificador,
      scope: SCOPES,
    }),
  });

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok || !datos.id_token) {
    throw crearError('Microsoft no completó el inicio de sesión', 502, 'microsoft');
  }
  return datos.id_token;
}

function validarIdentidad(claims, intento) {
  const { clientId, tenants, dominios } = config();
  const tenant = (claims.tid ?? '').toLowerCase();
  const ahora = Math.floor(Date.now() / 1000);

  if (claims.aud !== clientId || claims.nonce !== intento.nonce || !(claims.exp > ahora)) {
    throw crearError('Respuesta inválida de Microsoft', 401, 'microsoft');
  }
  if (!tenants.includes(tenant) || claims.iss !== `https://login.microsoftonline.com/${claims.tid}/v2.0`) {
    throw crearError('Solo se puede entrar con una cuenta de Kalop', 403, 'organizacion');
  }

  const correo = (claims.email || claims.preferred_username || '').trim().toLowerCase();
  const dominio = correo.split('@')[1];
  if (!correo.includes('@') || !dominios.includes(dominio)) {
    throw crearError('Solo se puede entrar con una cuenta de Kalop', 403, 'organizacion');
  }

  // El nombre y apellido sugeridos para el alta (la persona los puede corregir).
  const [nombre = '', ...resto] = (claims.name ?? '').trim().split(/\s+/);
  return {
    correo,
    nombre: (claims.given_name ?? nombre).slice(0, NOMBRE_LONGITUD_MAXIMA),
    apellido: (claims.family_name ?? resto.join(' ')).slice(0, NOMBRE_LONGITUD_MAXIMA),
  };
}

// Vuelta de Microsoft. Devuelve la sesión si el usuario ya existe, o los datos
// del alta pendiente (firmados) si es la primera vez que entra.
export async function completar({ code, estado, intento }) {
  if (!intento || !estado || estado !== intento.estado) {
    throw crearError('El intento de inicio de sesión venció. Probá de nuevo', 400, 'sesion');
  }
  if (!code) {
    throw crearError('Microsoft no completó el inicio de sesión', 400, 'microsoft');
  }

  const claims = decodificarIdToken(await pedirIdToken({ code, intento }));
  const identidad = validarIdentidad(claims, intento);

  const existente = await usuariosService.buscarPorCorreo(identidad.correo);
  if (!existente) {
    const alta = jwt.sign({ alta: identidad }, process.env.JWT_SECRET, { expiresIn: `${MINUTOS_ALTA}m` });
    return { alta, altaMaxAgeMs: MINUTOS_ALTA * 60 * 1000 };
  }

  if (!existente.activo) {
    throw crearError('Tu cuenta está deshabilitada. Contactá a un administrador', 403, 'deshabilitada');
  }
  const usuario = existente.email_verificado ? existente : { ...existente, ...(await usuariosService.marcarEmailVerificado(existente.id)) };

  return { sesion: await usuariosService.iniciarSesion(usuario, `Inicio de sesión con Microsoft 365 (${usuario.correo})`) };
}

export function leerAlta(cookie) {
  try {
    return jwt.verify(cookie, process.env.JWT_SECRET).alta ?? null;
  } catch {
    return null;
  }
}

// Primera vez: con los datos de Microsoft más sucursal y sector elegidos.
export async function confirmarAlta({ alta, nombre, apellido, idSucursal, idSector }) {
  if (!alta) {
    throw crearError('El alta venció. Volvé a entrar con Microsoft', 401);
  }

  const nombreLimpio = (nombre ?? '').trim();
  const apellidoLimpio = (apellido ?? '').trim();
  if (!nombreLimpio || !apellidoLimpio) {
    throw crearError('El nombre y el apellido son obligatorios', 400);
  }
  if (nombreLimpio.length > NOMBRE_LONGITUD_MAXIMA || apellidoLimpio.length > NOMBRE_LONGITUD_MAXIMA) {
    throw crearError(`El nombre y el apellido pueden tener hasta ${NOMBRE_LONGITUD_MAXIMA} caracteres`, 400);
  }

  const [sucursal, sector] = await Promise.all([sucursalesModel.findById(idSucursal), sectoresModel.findById(idSector)]);
  if (!sucursal?.activo || !sector?.activo) {
    throw crearError('Elegí una sucursal y un sector válidos', 400);
  }

  // Si mientras tanto alguien lo dio de alta (o abrió dos pestañas), se entra con esa cuenta.
  const existente = await usuariosService.buscarPorCorreo(alta.correo);
  if (existente) {
    if (!existente.activo) {
      throw crearError('Tu cuenta está deshabilitada. Contactá a un administrador', 403);
    }
    return usuariosService.iniciarSesion(existente, `Inicio de sesión con Microsoft 365 (${existente.correo})`);
  }

  const usuario = await usuariosService.crearUsuarioMicrosoft({
    nombre: nombreLimpio,
    apellido: apellidoLimpio,
    correo: alta.correo,
    idSucursal: sucursal.id,
    idSector: sector.id,
  });
  return usuariosService.iniciarSesion(usuario, `Inicio de sesión con Microsoft 365 (${usuario.correo})`);
}
