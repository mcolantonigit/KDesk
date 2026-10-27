import { API, apiFetch } from '../utils/api';

// Qué formas de entrar ofrece el backend según desde dónde se abre KDesk
// (desde internet, solo Microsoft 365). Si no responde, se muestra lo de siempre.
export async function getConfigLogin() {
  try {
    const response = await apiFetch(`${API}/api/auth/config`, { credentials: 'include' });
    if (!response.ok) throw new Error();
    return await response.json();
  } catch {
    return { password: true, microsoft: false };
  }
}

// El login con Microsoft es una navegación completa (no un fetch): el backend
// redirige a Microsoft y, a la vuelta, de nuevo a esta misma dirección.
export function urlLoginMicrosoft() {
  return `${API}/api/auth/microsoft/login?volver=${encodeURIComponent(window.location.origin)}`;
}

export async function getAltaPendiente() {
  const response = await apiFetch(`${API}/api/auth/microsoft/alta`, { credentials: 'include' });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'El alta venció. Volvé a entrar con Microsoft');
  }

  return data;
}

export async function confirmarAlta({ nombre, apellido, idSucursal, idSector }) {
  const response = await apiFetch(`${API}/api/auth/microsoft/alta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombre, apellido, idSucursal, idSector }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo completar el alta');
  }

  return data.usuario;
}
