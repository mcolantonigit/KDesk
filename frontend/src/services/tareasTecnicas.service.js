import { API, apiFetch } from '../utils/api';

export async function getTareas(idTicket) {
  const response = await apiFetch(`${API}/api/tickets/${idTicket}/tareas`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener las tareas');
  }

  return data;
}

export async function crearTarea(idTicket, descripcion) {
  const response = await apiFetch(`${API}/api/tickets/${idTicket}/tareas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ descripcion }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear la tarea');
  }

  return data;
}

export async function editarTarea(id, descripcion) {
  const response = await apiFetch(`${API}/api/tareas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ descripcion }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo editar la tarea');
  }

  return data;
}

export async function completarTarea(id) {
  const response = await apiFetch(`${API}/api/tareas/${id}/completar`, {
    method: 'PATCH',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo completar la tarea');
  }

  return data;
}

export async function eliminarTarea(id) {
  const response = await apiFetch(`${API}/api/tareas/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo eliminar la tarea');
  }

  return data;
}
