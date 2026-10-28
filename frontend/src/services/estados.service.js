import { API, apiFetch } from '../utils/api';

export async function getEstados() {
  const response = await apiFetch(`${API}/api/estados`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los estados');
  }

  return data;
}

export async function crearEstado(nombre) {
  const response = await apiFetch(`${API}/api/estados`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombre }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear el estado');
  }

  return data;
}

export async function editarEstado(id, cambios) {
  const response = await apiFetch(`${API}/api/estados/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(cambios),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo editar el estado');
  }

  return data;
}
