import { API } from '../utils/api';

export async function getAuditoria() {
  const response = await fetch(`${API}/api/auditoria`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener la auditoría');
  }

  return data;
}

export async function getRetencion() {
  const response = await fetch(`${API}/api/auditoria/retencion`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener la configuración de retención');
  }

  return data;
}

export async function actualizarRetencion(diasRetencionLogs) {
  const response = await fetch(`${API}/api/auditoria/retencion`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ diasRetencionLogs }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo actualizar la configuración de retención');
  }

  return data;
}

export async function limpiarLogs(diasPreservar) {
  const response = await fetch(`${API}/api/auditoria/limpiar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ diasPreservar }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo limpiar los logs');
  }

  return data;
}
