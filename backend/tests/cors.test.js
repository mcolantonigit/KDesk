import { describe, it, expect, afterEach } from 'vitest';
import { api } from './helpers.js';

describe('CORS para el frontend en Cloudflare', () => {
  afterEach(() => {
    delete process.env.CORS_ORIGINS;
  });

  it('sin CORS_ORIGINS no agrega ningún encabezado (red local, como siempre)', async () => {
    const res = await api().get('/api/estados').set('Origin', 'https://kdesk.ar');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('a un origen permitido le devuelve su origen y permite la cookie', async () => {
    process.env.CORS_ORIGINS = 'https://kdesk.ar, https://dev.kdesk.ar/';

    const res = await api().get('/api/estados').set('Origin', 'https://dev.kdesk.ar');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://dev.kdesk.ar');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(res.headers.vary).toMatch(/Origin/);
  });

  it('a un origen que no está en la lista no le da permiso', async () => {
    process.env.CORS_ORIGINS = 'https://kdesk.ar';

    const res = await api().get('/api/estados').set('Origin', 'https://otro-sitio.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('responde la consulta previa (OPTIONS) de un origen permitido', async () => {
    process.env.CORS_ORIGINS = 'https://kdesk.ar';

    const res = await api()
      .options('/api/tickets/5/tipo')
      .set('Origin', 'https://kdesk.ar')
      .set('Access-Control-Request-Method', 'PATCH');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-methods']).toMatch(/PATCH/);
    expect(res.headers['access-control-allow-headers']).toMatch(/Content-Type/);
  });
});
