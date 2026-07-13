export async function getRoles() {
  const response = await fetch('/api/roles');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los roles');
  }

  return data;
}
