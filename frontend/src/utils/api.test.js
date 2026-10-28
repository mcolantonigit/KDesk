import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, escucharApi, hayServidor, SIN_CONEXION, CONECTADO, SESION_VENCIDA } from './api';

function respuesta(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('apiFetch', () => {
  let eventos;
  let dejarDeEscuchar;

  beforeEach(() => {
    eventos = [];
    dejarDeEscuchar = escucharApi((evento) => eventos.push(evento));
  });

  afterEach(() => {
    dejarDeEscuchar();
    vi.unstubAllGlobals();
  });

  it('si el navegador no llega al servidor, avisa y tira un error claro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(apiFetch('/api/tickets')).rejects.toThrow('No hay conexión con el servidor de KDesk');
    expect(eventos).toEqual([SIN_CONEXION]);
  });

  it('un error de Cloudflare o del proxy (túnel caído) también es falta de servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 530 })));

    await expect(apiFetch('/api/tickets')).rejects.toThrow('No hay conexión');
    expect(eventos).toEqual([SIN_CONEXION]);
  });

  it('una respuesta del backend avisa que hay conexión y se devuelve tal cual', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(500, { message: 'Error interno' })));

    const res = await apiFetch('/api/tickets');

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: 'Error interno' });
    expect(eventos).toEqual([CONECTADO]);
  });

  it('un 401 por falta de sesión avisa que la sesión venció, sin consumir la respuesta', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(respuesta(401, { message: 'Token inválido o expirado', codigo: 'SESION' }))
    );

    const res = await apiFetch('/api/tickets');

    expect(eventos).toEqual([CONECTADO, SESION_VENCIDA]);
    expect((await res.json()).message).toBe('Token inválido o expirado');
  });

  it('un 401 por contraseña incorrecta no es sesión vencida', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(401, { message: 'La contraseña actual es incorrecta' })));

    await apiFetch('/api/usuarios/perfil/password');

    expect(eventos).toEqual([CONECTADO]);
  });

  it('hayServidor dice si el backend contesta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(200, { password: true })));
    expect(await hayServidor()).toBe(true);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    expect(await hayServidor()).toBe(false);
  });
});
