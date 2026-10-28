import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pool } from '../config/db.js';
import { api, crearUsuario, limpiarDatos } from './helpers.js';

const TENANT_AR = '11111111-1111-1111-1111-111111111111';
const TENANT_CL = '22222222-2222-2222-2222-222222222222';
const CLIENT_ID = 'app-kdesk';

const ENV_M365 = {
  M365_CLIENT_ID: CLIENT_ID,
  M365_CLIENT_SECRET: 'secreto',
  M365_TENANTS: `${TENANT_AR}, ${TENANT_CL}`,
  M365_DOMINIOS: 'tuempresa.com',
  FRONTEND_URL: 'http://localhost:5173',
  CORS_ORIGINS: 'https://dev.kdesk.ar',
};

function idToken(claims) {
  const parte = (objeto) => Buffer.from(JSON.stringify(objeto)).toString('base64url');
  return `${parte({ alg: 'RS256' })}.${parte(claims)}.firma`;
}

function cookiesDe(res) {
  return (res.headers['set-cookie'] ?? []).map((cookie) => cookie.split(';')[0]).filter((cookie) => !cookie.endsWith('='));
}

// Hace el viaje completo: /login (redirige a Microsoft) y vuelta al /callback
// con un id_token armado a gusto. Devuelve la respuesta del callback.
async function entrarConMicrosoft(claimsExtra = {}, { volver = 'https://dev.kdesk.ar' } = {}) {
  const inicio = await api().get('/api/auth/microsoft/login').query({ volver }).set('CF-Ray', 'abc');
  const autorizar = new URL(inicio.headers.location);
  const nonce = autorizar.searchParams.get('nonce');
  const estado = autorizar.searchParams.get('state');

  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      Response.json({
        id_token: idToken({
          aud: CLIENT_ID,
          tid: TENANT_AR,
          iss: `https://login.microsoftonline.com/${TENANT_AR}/v2.0`,
          exp: Math.floor(Date.now() / 1000) + 600,
          nonce,
          name: 'Ana María Pérez',
          email: 'ana@tuempresa.com',
          ...claimsExtra,
        }),
      })
    )
  );

  return api()
    .get('/api/auth/microsoft/callback')
    .query({ code: 'codigo', state: estado })
    .set('CF-Ray', 'abc')
    .set('Cookie', cookiesDe(inicio));
}

describe('login con Microsoft 365', () => {
  const envAnterior = { ...process.env };

  beforeEach(async () => {
    await limpiarDatos();
    Object.assign(process.env, ENV_M365);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...envAnterior };
  });

  it('el login redirige a Microsoft con PKCE y la dirección de vuelta pública (https)', async () => {
    const res = await api().get('/api/auth/microsoft/login').set('Host', 'api-dev.kdesk.ar').set('CF-Ray', 'abc');

    expect(res.status).toBe(302);
    const url = new URL(res.headers.location);
    expect(url.origin + url.pathname).toBe('https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize');
    expect(url.searchParams.get('client_id')).toBe(CLIENT_ID);
    expect(url.searchParams.get('redirect_uri')).toBe('https://api-dev.kdesk.ar/api/auth/microsoft/callback');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(cookiesDe(res).some((cookie) => cookie.startsWith('m365_intento='))).toBe(true);
  });

  it('sin configurar, no ofrece Microsoft y el login responde 503', async () => {
    delete process.env.M365_CLIENT_SECRET;

    expect((await api().get('/api/auth/config')).body.microsoft).toBe(false);
    expect((await api().get('/api/auth/microsoft/login')).status).toBe(503);
  });

  it('un usuario existente entra con su cuenta, por correo, y vuelve al frontend', async () => {
    const usuario = await crearUsuario();
    await pool.query('UPDATE usuarios SET correo = $1 WHERE id = $2', ['ana@tuempresa.com', usuario.id]);

    const res = await entrarConMicrosoft({ email: 'ANA@tuempresa.com' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://dev.kdesk.ar/');
    const sesion = cookiesDe(res).find((cookie) => cookie.startsWith('token='));
    expect(sesion).toBeDefined();

    const perfil = await api().get('/api/usuarios/perfil').set('Cookie', sesion);
    expect(perfil.body.id).toBe(usuario.id);

    const auditoria = await pool.query("SELECT detalle FROM auditoria WHERE accion = 'LOGIN'");
    expect(auditoria.rows[0].detalle).toBe('Inicio de sesión con Microsoft 365 (ana@tuempresa.com)');
  });

  it('el token pide el código con el verificador PKCE y el secreto de la app', async () => {
    await entrarConMicrosoft();

    const [url, opciones] = fetch.mock.calls[0];
    expect(url).toBe('https://login.microsoftonline.com/organizations/oauth2/v2.0/token');
    const cuerpo = new URLSearchParams(opciones.body);
    expect(cuerpo.get('client_secret')).toBe('secreto');
    expect(cuerpo.get('code')).toBe('codigo');
    expect(cuerpo.get('code_verifier')).toBeTruthy();
  });

  it('alguien nuevo pasa por completar el registro con sucursal y sector, y queda como usuario', async () => {
    const res = await entrarConMicrosoft();

    expect(res.headers.location).toBe('https://dev.kdesk.ar/completar-registro');
    const alta = cookiesDe(res).find((cookie) => cookie.startsWith('m365_alta='));
    expect(cookiesDe(res).some((cookie) => cookie.startsWith('token='))).toBe(false);

    const datos = await api().get('/api/auth/microsoft/alta').set('Cookie', alta);
    expect(datos.body).toEqual({ correo: 'ana@tuempresa.com', nombre: 'Ana', apellido: 'María Pérez' });

    const sucursal = (await pool.query('SELECT id FROM sucursales LIMIT 1')).rows[0].id;
    const sector = (await pool.query('SELECT id FROM sectores LIMIT 1')).rows[0].id;
    const confirmar = await api()
      .post('/api/auth/microsoft/alta')
      .set('Cookie', alta)
      .send({ nombre: 'Ana María', apellido: 'Pérez', idSucursal: sucursal, idSector: sector });

    expect(confirmar.status).toBe(201);
    expect(confirmar.body.usuario).toMatchObject({ correo: 'ana@tuempresa.com', nombre: 'Ana María', id_rol: 1, email_verificado: true });
    expect(cookiesDe(confirmar).some((cookie) => cookie.startsWith('token='))).toBe(true);

    // No tiene contraseña: el login con contraseña nunca le funciona
    const login = await api().post('/api/usuarios/login').send({ correo: 'ana@tuempresa.com', password: '!microsoft365' });
    expect(login.status).toBe(401);
  });

  it('el alta no se puede confirmar sin la cookie que deja Microsoft', async () => {
    const res = await api().post('/api/auth/microsoft/alta').send({ nombre: 'X', apellido: 'Y', idSucursal: 1, idSector: 1 });

    expect(res.status).toBe(401);
  });

  it('rechaza cuentas de otra organización, aunque el correo parezca de Kalop', async () => {
    const otroTenant = '99999999-9999-9999-9999-999999999999';
    const res = await entrarConMicrosoft({ tid: otroTenant, iss: `https://login.microsoftonline.com/${otroTenant}/v2.0` });

    expect(res.headers.location).toBe('https://dev.kdesk.ar/login?error=organizacion');
    expect(cookiesDe(res).some((cookie) => cookie.startsWith('token='))).toBe(false);
  });

  it('rechaza un correo de otro dominio aunque sea del tenant de Kalop', async () => {
    const res = await entrarConMicrosoft({ email: 'alguien@gmail.com' });

    expect(res.headers.location).toBe('https://dev.kdesk.ar/login?error=organizacion');
  });

  it('acepta el tenant de Chile', async () => {
    await crearUsuario().then((u) => pool.query('UPDATE usuarios SET correo = $1 WHERE id = $2', ['ana@tuempresa.com', u.id]));

    const res = await entrarConMicrosoft({ tid: TENANT_CL, iss: `https://login.microsoftonline.com/${TENANT_CL}/v2.0` });

    expect(res.headers.location).toBe('https://dev.kdesk.ar/');
  });

  it('rechaza un token con otro nonce, otra audiencia o vencido', async () => {
    for (const claims of [{ nonce: 'otro' }, { aud: 'otra-app' }, { exp: Math.floor(Date.now() / 1000) - 10 }]) {
      const res = await entrarConMicrosoft(claims);
      expect(res.headers.location).toBe('https://dev.kdesk.ar/login?error=microsoft');
    }
  });

  it('un state que no coincide (o sin la cookie del intento) no inicia sesión', async () => {
    const res = await api().get('/api/auth/microsoft/callback').query({ code: 'codigo', state: 'inventado' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('http://localhost:5173/login?error=sesion');
  });

  it('una cuenta deshabilitada no entra', async () => {
    const usuario = await crearUsuario();
    await pool.query('UPDATE usuarios SET correo = $1, activo = FALSE WHERE id = $2', ['ana@tuempresa.com', usuario.id]);

    const res = await entrarConMicrosoft();

    expect(res.headers.location).toBe('https://dev.kdesk.ar/login?error=deshabilitada');
  });

  it('solo vuelve a frontends conocidos', async () => {
    const res = await api().get('/api/auth/microsoft/login').query({ volver: 'https://sitio-malo.com' });
    const intento = cookiesDe(res);

    const vuelta = await api().get('/api/auth/microsoft/callback').query({ error: 'access_denied' }).set('Cookie', intento);

    expect(vuelta.headers.location).toBe('http://localhost:5173/login?error=microsoft');
  });
});

describe('login con contraseña según LOGIN_PASSWORD', () => {
  const envAnterior = { ...process.env };

  afterEach(() => {
    process.env = { ...envAnterior };
  });

  it('con "local": desde internet se rechaza; desde la red local sigue funcionando', async () => {
    process.env.LOGIN_PASSWORD = 'local';

    const internet = await api().post('/api/usuarios/login').set('CF-Connecting-IP', '1.2.3.4').send({ correo: 'x@tuempresa.com', password: 'x' });
    expect(internet.status).toBe(403);
    expect((await api().get('/api/auth/config').set('CF-Ray', 'abc')).body.password).toBe(false);

    const local = await api().post('/api/usuarios/login').send({ correo: 'x@tuempresa.com', password: 'x' });
    expect(local.status).toBe(401); // llega al login (usuario inexistente), no lo frena el bloqueo
    expect((await api().get('/api/auth/config')).body.password).toBe(true);
  });

  it('con "local", desde internet tampoco hay registro ni recuperación de contraseña', async () => {
    process.env.LOGIN_PASSWORD = 'local';

    for (const ruta of ['register', 'activar', 'reenviar-activacion', 'recuperar-password', 'resetear-password']) {
      const res = await api().post(`/api/usuarios/${ruta}`).set('CF-Ray', 'abc').send({});
      expect(res.status).toBe(403);
    }
  });

  it('con "off" se rechaza en todos lados', async () => {
    process.env.LOGIN_PASSWORD = 'off';

    expect((await api().post('/api/usuarios/login').send({})).status).toBe(403);
    expect((await api().get('/api/auth/config')).body.password).toBe(false);
  });

  it('vacío: como siempre, en todos lados', async () => {
    delete process.env.LOGIN_PASSWORD;

    const res = await api().post('/api/usuarios/login').set('CF-Ray', 'abc').send({ correo: 'x@tuempresa.com', password: 'x' });
    expect(res.status).toBe(401);
  });
});
