import { API, apiFetch } from '../utils/api';

export async function getNotificaciones({ despuesDe, limite } = {}) {
  const parametros = new URLSearchParams();
  if (despuesDe !== undefined) parametros.set('despuesDe', despuesDe);
  if (limite !== undefined) parametros.set('limite', limite);
  const consulta = parametros.toString();

  const response = await apiFetch(`${API}/api/notificaciones${consulta ? `?${consulta}` : ''}`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener las notificaciones');
  }

  return data;
}
