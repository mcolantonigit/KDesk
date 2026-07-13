export async function getSectores() {
  const response = await fetch('/api/sectores');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los sectores');
  }

  return data;
}

export async function crearSector(nombre) {
  const response = await fetch('/api/sectores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombre }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear el sector');
  }

  return data;
}

export async function editarSector(id, cambios) {
  const response = await fetch(`/api/sectores/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(cambios),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo editar el sector');
  }

  return data;
}
