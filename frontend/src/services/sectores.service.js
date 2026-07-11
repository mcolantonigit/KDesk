export async function getSectores() {
  const response = await fetch('/api/sectores');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los sectores');
  }

  return data;
}
