export async function getTiposTicket() {
  const response = await fetch('/api/tipos-ticket');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los tipos de ticket');
  }

  return data;
}

export async function crearTipoTicket(nombre) {
  const response = await fetch('/api/tipos-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombre }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear el tipo de ticket');
  }

  return data;
}

export async function editarTipoTicket(id, cambios) {
  const response = await fetch(`/api/tipos-ticket/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(cambios),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo editar el tipo de ticket');
  }

  return data;
}
