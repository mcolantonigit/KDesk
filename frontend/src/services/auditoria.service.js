export async function getAuditoria() {
  const response = await fetch('/api/auditoria', { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener la auditoría');
  }

  return data;
}
