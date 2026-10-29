import { API, apiFetch } from '../utils/api';

export async function login({ correo, password }) {
  const response = await apiFetch(`${API}/api/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ correo, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo iniciar sesión');
  }

  return data.usuario;
}

export async function register({ nombre, apellido, correo, password, idSucursal, idSector }) {
  const response = await apiFetch(`${API}/api/usuarios/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, correo, password, idSucursal, idSector }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo registrar el usuario');
  }

  return data;
}

export async function activarCuenta(token) {
  const response = await apiFetch(`${API}/api/usuarios/activar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo activar la cuenta');
  }

  return data;
}

export async function reenviarActivacion(correo) {
  const response = await apiFetch(`${API}/api/usuarios/reenviar-activacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo reenviar el correo de activación');
  }

  return data;
}

export async function solicitarResetPassword(correo) {
  const response = await apiFetch(`${API}/api/usuarios/recuperar-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo procesar la solicitud');
  }

  return data;
}

export async function resetearPassword({ token, passwordNueva, confirmacion }) {
  const response = await apiFetch(`${API}/api/usuarios/resetear-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, passwordNueva, confirmacion }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo restablecer la contraseña');
  }

  return data;
}

export async function getPerfil() {
  const response = await apiFetch(`${API}/api/usuarios/perfil`, { credentials: 'include' });

  if (response.status === 401) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo obtener el perfil');
  }

  return data;
}

export async function getUsuarios() {
  const response = await apiFetch(`${API}/api/usuarios`, { credentials: 'include' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron obtener los usuarios');
  }

  return data;
}

export async function cambiarRolUsuario(id, idRol) {
  const response = await apiFetch(`${API}/api/usuarios/${id}/rol`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idRol }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cambiar el rol');
  }

  return data;
}

export async function actualizarPerfil({ nombre, apellido }) {
  const response = await apiFetch(`${API}/api/usuarios/perfil`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombre, apellido }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudieron guardar los datos');
  }

  return data;
}

export async function cambiarPassword({ passwordActual, passwordNueva, confirmacion }) {
  const response = await apiFetch(`${API}/api/usuarios/perfil/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ passwordActual, passwordNueva, confirmacion }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cambiar la contraseña');
  }

  return data;
}

export async function cambiarKadiUsuario(id, habilitada) {
  const response = await apiFetch(`${API}/api/usuarios/${id}/kadi`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ habilitada }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cambiar Kadi para el usuario');
  }

  return data;
}

export async function cambiarEstadoActivo(id, activo) {
  const response = await apiFetch(`${API}/api/usuarios/${id}/activo`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ activo }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cambiar el estado del usuario');
  }

  return data;
}

export async function blanquearPassword(id, passwordNueva) {
  const response = await apiFetch(`${API}/api/usuarios/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ passwordNueva }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo blanquear la contraseña');
  }

  return data;
}

export async function logout() {
  const response = await apiFetch(`${API}/api/usuarios/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cerrar sesión');
  }

  return data;
}
