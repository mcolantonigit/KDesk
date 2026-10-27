// Pages Function: reenvía todo /api/* al backend del server local, que está
// detrás de un Cloudflare Tunnel protegido con Access. El navegador solo
// habla con la dirección de Pages (mismo origen: sin CORS y con la cookie de
// sesión de siempre); el token de Access nunca sale de Cloudflare.
//
// Variables de Pages (Settings → Variables and Secrets), por entorno:
//   API_ORIGIN               ej. https://api-dev.kdesk.ar (Preview) o https://api.kdesk.ar (Production)
//   CF_ACCESS_CLIENT_ID      token de servicio de Access (ID)
//   CF_ACCESS_CLIENT_SECRET  token de servicio de Access (secreto)
//
// Esta carpeta solo la usa Cloudflare Pages: el backend local (Express) no la sirve.

// Encabezados que el navegador no puede elegir: los pone Cloudflare o esta función.
const ENCABEZADOS_QUITADOS = ['host', 'cf-access-client-id', 'cf-access-client-secret', 'cf-access-token'];

function sinConfigurar() {
  return Response.json({ message: 'KDesk todavía no está conectado al servidor' }, { status: 503 });
}

export async function onRequest({ request, env }) {
  if (!env.API_ORIGIN || !env.CF_ACCESS_CLIENT_ID || !env.CF_ACCESS_CLIENT_SECRET) {
    return sinConfigurar();
  }

  const entrante = new URL(request.url);
  const destino = new URL(entrante.pathname + entrante.search, env.API_ORIGIN);

  const encabezados = new Headers(request.headers);
  ENCABEZADOS_QUITADOS.forEach((nombre) => encabezados.delete(nombre));
  encabezados.set('CF-Access-Client-Id', env.CF_ACCESS_CLIENT_ID);
  encabezados.set('CF-Access-Client-Secret', env.CF_ACCESS_CLIENT_SECRET);

  const conCuerpo = !['GET', 'HEAD'].includes(request.method);

  try {
    // redirect: 'manual' para que una redirección del backend llegue tal cual al navegador.
    return await fetch(destino, {
      method: request.method,
      headers: encabezados,
      body: conCuerpo ? request.body : undefined,
      redirect: 'manual',
    });
  } catch {
    return Response.json({ message: 'No se pudo conectar con el servidor de KDesk' }, { status: 502 });
  }
}
