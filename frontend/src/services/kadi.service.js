import { API, apiFetch } from '../utils/api';

export async function getEstadoKadi() {
  const response = await apiFetch(`${API}/api/kadi/estado`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo consultar a Kadi');
  }

  return data.habilitada;
}

// `mensajes`: [{ rol: 'kadi' | 'persona', texto }]. Devuelve { mensaje, ticket }:
// `ticket` es la propuesta de Kadi (con los nombres) o null si todavía falta info.
export async function enviarMensajeAKadi(mensajes) {
  const response = await apiFetch(`${API}/api/kadi/mensaje`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ mensajes }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Kadi no pudo responder');
  }

  return data;
}
