// Dirección del backend. En la red local (build del server y `npm run dev`)
// queda vacía y se usa "/api" en el mismo origen, como siempre. En Cloudflare
// Pages se define VITE_API_URL al compilar (ej. https://api.kdesk.ar) y el
// navegador le pide directo a la API por el Tunnel.
export const API = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

// Respuestas que no vienen del backend sino del camino hasta él: proxy o
// Cloudflare sin poder llegar al server (502/503/504 y los 52x de Cloudflare).
const ESTADOS_SIN_SERVIDOR = new Set([502, 503, 504, 520, 521, 522, 523, 524, 525, 526, 530]);

export const SIN_CONEXION = 'sin-conexion';
export const CONECTADO = 'conectado';
export const SESION_VENCIDA = 'sesion-vencida';

const oyentes = new Set();

// Avisa a la app cuando se corta o vuelve la conexión con el backend, y cuando
// la sesión dejó de valer. Devuelve la función para dejar de escuchar.
export function escucharApi(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

function avisar(evento) {
  oyentes.forEach((oyente) => oyente(evento));
}

// Igual que fetch, pero detecta la falta de servidor y la sesión vencida para
// que la app muestre la pantalla que corresponde.
export async function apiFetch(url, opciones) {
  let response;
  try {
    response = await fetch(url, opciones);
  } catch {
    avisar(SIN_CONEXION);
    throw new Error('No hay conexión con el servidor de KDesk');
  }

  if (ESTADOS_SIN_SERVIDOR.has(response.status)) {
    avisar(SIN_CONEXION);
    throw new Error('No hay conexión con el servidor de KDesk');
  }
  avisar(CONECTADO);

  if (response.status === 401) {
    const data = await response
      .clone()
      .json()
      .catch(() => null);
    // Solo la falta de sesión: un 401 por contraseña incorrecta no cuenta.
    if (data?.codigo === 'SESION') avisar(SESION_VENCIDA);
  }

  return response;
}

// Pedido mínimo para saber si el backend volvió.
export async function hayServidor() {
  try {
    await apiFetch(`${API}/api/auth/config`, { credentials: 'include' });
    return true;
  } catch {
    return false;
  }
}
