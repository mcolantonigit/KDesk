export async function getSucursales() {
  const response = await fetch('/api/sucursales');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener las sucursales');
  }

  return data;
}

export async function crearSucursal(nombre) {
  const response = await fetch('/api/sucursales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombre }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear la sucursal');
  }

  return data;
}

export async function editarSucursal(id, cambios) {
  const response = await fetch(`/api/sucursales/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(cambios),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo editar la sucursal');
  }

  return data;
}
