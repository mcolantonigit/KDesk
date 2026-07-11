export async function getSucursales() {
  const response = await fetch('/api/sucursales');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener las sucursales');
  }

  return data;
}
