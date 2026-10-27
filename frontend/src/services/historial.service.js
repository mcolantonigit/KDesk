import { API, apiFetch } from '../utils/api';

export async function getHistorial(idTicket) {
  const response = await apiFetch(`${API}/api/tickets/${idTicket}/historial`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener el historial');
  }

  return data;
}
