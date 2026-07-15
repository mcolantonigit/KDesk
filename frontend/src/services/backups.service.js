export async function getBackups() {
  const response = await fetch('/api/backups', { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los backups');
  }

  return data;
}

export async function generarBackupManual() {
  const response = await fetch('/api/backups', { method: 'POST', credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo generar el backup');
  }

  return data;
}

export function urlDescargaBackup(nombreArchivo) {
  return `/api/backups/${encodeURIComponent(nombreArchivo)}/descargar`;
}

export async function restaurarBackup(nombreArchivo) {
  const response = await fetch('/api/backups/restaurar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombreArchivo }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo restaurar el backup');
  }

  return data;
}

export async function restaurarDesdeArchivo(archivo) {
  const formData = new FormData();
  formData.append('archivo', archivo);

  const response = await fetch('/api/backups/restaurar-archivo', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo restaurar el backup');
  }

  return data;
}

export async function getConfiguracionBackup() {
  const response = await fetch('/api/backups/configuracion', { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener la configuración de backups');
  }

  return data;
}

export async function actualizarConfiguracionBackup({ activo, dias, hora }) {
  const response = await fetch('/api/backups/configuracion', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ activo, dias, hora }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo actualizar la configuración de backups');
  }

  return data;
}
