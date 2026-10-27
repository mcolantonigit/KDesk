import { API } from '../utils/api';

export async function getPrioridades() {
  const response = await fetch(`${API}/api/prioridades`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener las prioridades');
  }

  return data;
}

export async function crearPrioridad(nombre) {
  const response = await fetch(`${API}/api/prioridades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombre }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear la prioridad');
  }

  return data;
}

export async function editarPrioridad(id, cambios) {
  const response = await fetch(`${API}/api/prioridades/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(cambios),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo editar la prioridad');
  }

  return data;
}
