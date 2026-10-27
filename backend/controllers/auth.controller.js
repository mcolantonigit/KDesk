import * as microsoftService from '../services/microsoft.service.js';
import { loginConPasswordPermitido, vieneDeInternet } from '../utils/origen.util.js';
import { ponerCookieSesion } from '../utils/sesion.util.js';

const COOKIE_INTENTO = 'm365_intento';
const COOKIE_ALTA = 'm365_alta';
const RUTA_COOKIES = '/api/auth/microsoft';

// Lax (no Strict): la vuelta desde Microsoft es una navegación que viene de
// otro sitio, y con Strict el navegador no mandaría estas cookies.
function opcionesCookie(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: RUTA_COOKIES,
    ...(maxAge ? { maxAge } : {}),
  };
}

function redirectUri(req) {
  const protocolo = vieneDeInternet(req) ? 'https' : req.protocol;
  return `${protocolo}://${req.get('host')}${RUTA_COOKIES}/callback`;
}

// Qué formas de entrar ofrece la pantalla de login, según desde dónde se abre.
export function getConfig(req, res) {
  res.json({ password: loginConPasswordPermitido(req), microsoft: microsoftService.habilitado() });
}

export function iniciarMicrosoft(req, res) {
  try {
    const volver = microsoftService.frontendDeVuelta(req.query.volver);
    const { url, cookie, maxAgeMs } = microsoftService.iniciar({ redirectUri: redirectUri(req), volver });
    res.cookie(COOKIE_INTENTO, cookie, opcionesCookie(maxAgeMs));
    res.redirect(url);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo iniciar sesión con Microsoft' });
  }
}

export async function callbackMicrosoft(req, res) {
  const intento = microsoftService.leerIntento(req.cookies[COOKIE_INTENTO]);
  const volver = intento?.volver ?? microsoftService.frontendDeVuelta();
  res.clearCookie(COOKIE_INTENTO, opcionesCookie());

  try {
    if (req.query.error) {
      throw Object.assign(new Error('Microsoft no completó el inicio de sesión'), { codigo: 'microsoft' });
    }

    const resultado = await microsoftService.completar({ code: req.query.code, estado: req.query.state, intento });

    if (resultado.alta) {
      res.cookie(COOKIE_ALTA, resultado.alta, opcionesCookie(resultado.altaMaxAgeMs));
      return res.redirect(`${volver}/completar-registro`);
    }

    ponerCookieSesion(res, resultado.sesion.token);
    res.redirect(`${volver}/`);
  } catch (error) {
    res.redirect(`${volver}/login?error=${error.codigo ?? 'error'}`);
  }
}

export function getAlta(req, res) {
  const alta = microsoftService.leerAlta(req.cookies[COOKIE_ALTA]);
  if (!alta) {
    return res.status(401).json({ message: 'El alta venció. Volvé a entrar con Microsoft' });
  }
  res.json(alta);
}

export async function confirmarAlta(req, res) {
  try {
    const { nombre, apellido, idSucursal, idSector } = req.body;
    const { token, usuario } = await microsoftService.confirmarAlta({
      alta: microsoftService.leerAlta(req.cookies[COOKIE_ALTA]),
      nombre,
      apellido,
      idSucursal,
      idSector,
    });
    res.clearCookie(COOKIE_ALTA, opcionesCookie());
    ponerCookieSesion(res, token);
    res.status(201).json({ usuario });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'No se pudo completar el alta' });
  }
}
