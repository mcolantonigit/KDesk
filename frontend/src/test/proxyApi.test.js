// @vitest-environment node
// El test vive fuera de functions/: Pages convierte cada archivo de esa carpeta en una ruta.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequest } from '../../functions/api/[[path]].js';

const ENV = {
  API_ORIGIN: 'https://api-dev.kdesk.ar',
  CF_ACCESS_CLIENT_ID: 'id-de-prueba',
  CF_ACCESS_CLIENT_SECRET: 'secreto-de-prueba',
};

function simularBackend(respuesta = new Response('{}', { status: 200 })) {
  const fetchSimulado = vi.fn().mockResolvedValue(respuesta);
  vi.stubGlobal('fetch', fetchSimulado);
  return fetchSimulado;
}

describe('reenvío de /api al backend (Pages Function)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reenvía ruta, query, método, cookie y cuerpo, con el token de Access', async () => {
    const fetchSimulado = simularBackend();
    const request = new Request('https://kdesk.pages.dev/api/tickets/5/tipo?x=1', {
      method: 'PATCH',
      headers: { Cookie: 'token=abc', 'Content-Type': 'application/json' },
      body: JSON.stringify({ idTipo: 2 }),
    });

    await onRequest({ request, env: ENV });

    const [destino, opciones] = fetchSimulado.mock.calls[0];
    expect(destino.href).toBe('https://api-dev.kdesk.ar/api/tickets/5/tipo?x=1');
    expect(opciones.method).toBe('PATCH');
    expect(opciones.redirect).toBe('manual');
    expect(opciones.headers.get('cookie')).toBe('token=abc');
    expect(opciones.headers.get('cf-access-client-id')).toBe('id-de-prueba');
    expect(opciones.headers.get('cf-access-client-secret')).toBe('secreto-de-prueba');
    expect(await new Response(opciones.body).text()).toBe('{"idTipo":2}');
  });

  it('el navegador no puede mandar su propio token de Access', async () => {
    const fetchSimulado = simularBackend();
    const request = new Request('https://kdesk.pages.dev/api/tickets', {
      headers: { 'CF-Access-Client-Id': 'trucho', 'CF-Access-Client-Secret': 'trucho' },
    });

    await onRequest({ request, env: ENV });

    const [, opciones] = fetchSimulado.mock.calls[0];
    expect(opciones.headers.get('cf-access-client-id')).toBe('id-de-prueba');
    expect(opciones.headers.get('cf-access-client-secret')).toBe('secreto-de-prueba');
    expect(opciones.body).toBeUndefined();
  });

  it('devuelve la respuesta del backend tal cual, incluida la cookie de sesión', async () => {
    simularBackend(
      new Response('{"id":1}', { status: 200, headers: { 'Set-Cookie': 'token=nuevo; HttpOnly; SameSite=Strict' } })
    );

    const respuesta = await onRequest({ request: new Request('https://kdesk.pages.dev/api/usuarios/login', { method: 'POST', body: '{}' }), env: ENV });

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get('set-cookie')).toBe('token=nuevo; HttpOnly; SameSite=Strict');
    expect(await respuesta.json()).toEqual({ id: 1 });
  });

  it('sin las variables configuradas responde 503 y no le pega a nadie', async () => {
    const fetchSimulado = simularBackend();

    const respuesta = await onRequest({ request: new Request('https://kdesk.pages.dev/api/tickets'), env: {} });

    expect(respuesta.status).toBe(503);
    expect((await respuesta.json()).message).toMatch(/todavía no está conectado/);
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it('si el túnel no responde, devuelve 502 con un mensaje claro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const respuesta = await onRequest({ request: new Request('https://kdesk.pages.dev/api/tickets'), env: ENV });

    expect(respuesta.status).toBe(502);
  });
});
